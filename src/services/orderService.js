import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase.js";

const RECENT_ORDERS_KEY = "@soft_billing_recent_orders";
const OFFLINE_QUEUE_KEY = "@soft_billing_offline_queue";

let simulationOffline = false;

export function setSimulatedOfflineMode(val) {
  simulationOffline = !!val;
  console.log("[OrderService] Simulated offline mode set to:", simulationOffline);
}

export function isSimulatedOffline() {
  return simulationOffline;
}

export function calculateOrderTotals(cartItems) {
  let subtotal_taxable = 0;
  let total_cgst = 0;
  let total_sgst = 0;

  const processedItems = (cartItems || [])
    .filter(item => Number(item.quantity || 0) > 0)
    .map(item => {
      const rate = Number(item.selling_rate || item.rate || 0);
      const qty = Number(item.quantity || 1);
      const taxRate = Number(item.tax_rate || 0);

      const taxable = Math.round(rate * qty * 100) / 100;
      const cgst = Math.round((taxable * (taxRate / 2) / 100) * 100) / 100;
      const sgst = Math.round((taxable * (taxRate / 2) / 100) * 100) / 100;
      const total = Math.round((taxable + cgst + sgst) * 100) / 100;

      subtotal_taxable += taxable;
      total_cgst += cgst;
      total_sgst += sgst;

      return {
        product_id: item.id || null,
        item_name: item.name,
        quantity: qty,
        unit: item.unit || "PCS",
        rate: rate,
        tax_rate: taxRate,
        taxable_amount: taxable,
        cgst_amount: cgst,
        sgst_amount: sgst,
        igst_amount: 0,
        total_amount: total,
        mrp: Number(item.mrp || rate)
      };
    });

  subtotal_taxable = Math.round(subtotal_taxable * 100) / 100;
  total_cgst = Math.round(total_cgst * 100) / 100;
  total_sgst = Math.round(total_sgst * 100) / 100;
  const grand_total = Math.round((subtotal_taxable + total_cgst + total_sgst) * 100) / 100;

  return {
    items: processedItems,
    subtotal_taxable,
    total_cgst,
    total_sgst,
    total_igst: 0,
    grand_total
  };
}

export async function sendOrder(orderData) {
  const orderNumber = "ORD-" + Math.floor(100000 + Math.random() * 900000);
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);

  const payload = {
    order_number: orderNumber,
    replaces_order_number: orderData.replaces_order_number || null,
    is_revision: !!orderData.replaces_order_number,
    order_date: dateStr,
    salesman_name: orderData.salesman_name || "Field Salesman",
    salesman_phone: orderData.salesman_phone || "",
    beat_name: orderData.beat_name || "",
    retailer_id: orderData.retailer_id || null,
    retailer_name: orderData.retailer_name || "Retailer",
    retailer_phone: orderData.retailer_phone || "",
    retailer_address: orderData.retailer_address || "",
    notes: orderData.notes || "",
    subtotal_taxable: orderData.subtotal_taxable,
    total_cgst: orderData.total_cgst,
    total_sgst: orderData.total_sgst,
    total_igst: 0,
    grand_total: orderData.grand_total,
    items: orderData.items,
    created_at: now.toISOString()
  };

  let dispatched = false;

  // Check if simulated offline or real offline
  if (simulationOffline) {
    console.log("[OrderService] Offline Mode active: saving order directly to local storage.");
    await enqueueOfflineOrder(payload);
  } else {
    try {
      // 2.5s timeout promise race in case network hangs in low reception
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Network timeout (Basement mode)")), 2500)
      );

      const orderDocRef = doc(db, "transient_orders", orderNumber);
      await Promise.race([
        setDoc(orderDocRef, payload),
        timeoutPromise
      ]);

      dispatched = true;
      console.log("[OrderService] Order", orderNumber, "written to transient_orders");
    } catch (err) {
      console.warn("[OrderService] Cloud dispatch failed (offline mode):", err.message);
      // Queue locally in phone storage
      await enqueueOfflineOrder(payload);
    }
  }

  // Record in local history
  await saveRecentOrder({
    ...payload,
    status: dispatched ? (payload.is_revision ? "Revised" : "Dispatched") : "Offline Queued"
  });

  return {
    success: true,
    orderNumber,
    isOffline: !dispatched,
    payload
  };
}

async function enqueueOfflineOrder(order) {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    const queue = raw ? JSON.parse(raw) : [];
    if (!queue.some(o => o.order_number === order.order_number)) {
      queue.push(order);
    }
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error("Failed to queue offline order", e);
  }
}

export async function getOfflineQueueCount() {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return 0;
    const queue = JSON.parse(raw);
    return Array.isArray(queue) ? queue.length : 0;
  } catch (e) {
    return 0;
  }
}

export async function flushOfflineQueue() {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return { flushed: 0, remaining: 0 };
    const queue = JSON.parse(raw);
    if (!Array.isArray(queue) || queue.length === 0) return { flushed: 0, remaining: 0 };

    const remaining = [];
    let flushedCount = 0;

    for (const order of queue) {
      try {
        const orderDocRef = doc(db, "transient_orders", order.order_number);
        await setDoc(orderDocRef, order);
        flushedCount++;
        await updateOrderStatusInRecent(order.order_number, "Dispatched");
      } catch (err) {
        console.warn("[OrderService] Could not flush order " + order.order_number, err.message);
        remaining.push(order);
      }
    }

    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    return { flushed: flushedCount, remaining: remaining.length };
  } catch (e) {
    return { flushed: 0, remaining: 0, error: e.message };
  }
}

async function updateOrderStatusInRecent(orderNumber, newStatus) {
  try {
    const raw = await AsyncStorage.getItem(RECENT_ORDERS_KEY);
    if (!raw) return;
    const list = JSON.parse(raw);
    const updated = list.map(o => o.order_number === orderNumber ? { ...o, status: newStatus } : o);
    await AsyncStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(updated));
  } catch (e) {}
}

async function saveRecentOrder(order) {
  try {
    const raw = await AsyncStorage.getItem(RECENT_ORDERS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(o => o.order_number !== order.order_number);
    filtered.unshift(order);
    const trimmed = filtered.slice(0, 50);
    await AsyncStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error("Failed saving recent order", e);
  }
}

export async function getRecentOrders() {
  try {
    const raw = await AsyncStorage.getItem(RECENT_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export async function markOrderAsRevised(originalOrderNumber, newOrderNumber) {
  try {
    const raw = await AsyncStorage.getItem(RECENT_ORDERS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      const updated = list.map(o => {
        if (o.order_number === originalOrderNumber) {
          return {
            ...o,
            status: "Replaced",
            is_replaced: true,
            replaced_by: newOrderNumber,
            notes: (o.notes ? o.notes + " " : "") + `[Replaced by #${newOrderNumber}]`
          };
        }
        return o;
      });
      await AsyncStorage.setItem(RECENT_ORDERS_KEY, JSON.stringify(updated));
    }

    // Remove from offline queue if it had not synced yet
    const queueRaw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (queueRaw) {
      const q = JSON.parse(queueRaw);
      const filteredQ = q.filter(o => o.order_number !== originalOrderNumber);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filteredQ));
    }
  } catch (e) {
    console.warn("Could not mark order as revised:", e);
  }
}
