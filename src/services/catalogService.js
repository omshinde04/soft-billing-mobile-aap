import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase.js";
import {
  DEFAULT_PRODUCTS,
  DEFAULT_RETAILERS,
  DEFAULT_BEATS,
  DEFAULT_SALESMEN
} from "../data/mockCatalog.js";

const PRODUCTS_CACHE_KEY = "@soft_billing_catalog_products";
const RETAILERS_CACHE_KEY = "@soft_billing_catalog_retailers";
const SALESMEN_CACHE_KEY = "@soft_billing_catalog_salesmen";
const SESSION_KEY = "@soft_billing_session";

export async function fetchCatalogFromCloud() {
  let products = null;
  let retailers = null;
  let salesmen = null;

  try {
    // 1. Attempt to fetch live catalog synced by Desktop Master
    const prodDocRef = doc(db, "catalog", "products");
    const prodSnap = await getDoc(prodDocRef);
    if (prodSnap.exists() && Array.isArray(prodSnap.data()?.items) && prodSnap.data().items.length > 0) {
      products = prodSnap.data().items;
      await AsyncStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(products));
    }

    const retDocRef = doc(db, "catalog", "retailers");
    const retSnap = await getDoc(retDocRef);
    if (retSnap.exists() && Array.isArray(retSnap.data()?.items) && retSnap.data().items.length > 0) {
      retailers = retSnap.data().items;
      await AsyncStorage.setItem(RETAILERS_CACHE_KEY, JSON.stringify(retailers));
    }

    const salesDocRef = doc(db, "catalog", "salesmen");
    const salesSnap = await getDoc(salesDocRef);
    if (salesSnap.exists() && Array.isArray(salesSnap.data()?.items) && salesSnap.data().items.length > 0) {
      salesmen = salesSnap.data().items;
      await AsyncStorage.setItem(SALESMEN_CACHE_KEY, JSON.stringify(salesmen));
    }
  } catch (error) {
    console.warn("[CatalogService] Could not reach cloud catalog, will fall back to cache:", error.message);
  }

  // 2. If not loaded from cloud, load from local storage cache
  if (!products) {
    const cachedProds = await AsyncStorage.getItem(PRODUCTS_CACHE_KEY);
    if (cachedProds) {
      try { products = JSON.parse(cachedProds); } catch (e) { products = null; }
    }
  }

  if (!retailers) {
    const cachedRets = await AsyncStorage.getItem(RETAILERS_CACHE_KEY);
    if (cachedRets) {
      try { retailers = JSON.parse(cachedRets); } catch (e) { retailers = null; }
    }
  }

  if (!salesmen) {
    const cachedSales = await AsyncStorage.getItem(SALESMEN_CACHE_KEY);
    if (cachedSales) {
      try { salesmen = JSON.parse(cachedSales); } catch (e) { salesmen = null; }
    }
  }

  // 3. Fallback to default mock catalog if first time launching offline
  if (!products || products.length === 0) products = DEFAULT_PRODUCTS;
  if (!retailers || retailers.length === 0) retailers = DEFAULT_RETAILERS;
  if (!salesmen || salesmen.length === 0) salesmen = DEFAULT_SALESMEN;

  // Extract distinct beats
  const beatsSet = new Set(DEFAULT_BEATS);
  retailers.forEach(r => {
    if (r.beat_name) beatsSet.add(r.beat_name);
  });
  salesmen.forEach(s => {
    if (s.assigned_beat) beatsSet.add(s.assigned_beat);
  });

  return {
    products,
    retailers,
    beats: Array.from(beatsSet),
    salesmen
  };
}

export async function authenticateSalesman(identifier, password) {
  const { salesmen } = await fetchCatalogFromCloud();
  const cleanId = String(identifier || "").trim().toLowerCase();
  const cleanPass = String(password || "").trim();

  const found = salesmen.find(s =>
    (String(s.login_id || "").toLowerCase() === cleanId || String(s.phone || "") === cleanId) &&
    String(s.password || "") === cleanPass
  );

  if (found) {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(found));
    return { success: true, salesman: found };
  }
  return { success: false, error: "Invalid Salesman ID/Phone or Password/PIN" };
}

export async function getActiveSession() {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export async function clearActiveSession() {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
  } catch (e) {}
}
