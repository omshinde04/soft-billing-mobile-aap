import { Linking, Platform } from "react-native";

export function formatWhatsAppReceipt(order) {
  const retailer = order.retailer_name || order.payload?.retailer_name || "Kirana Store";
  const beat = order.beat_name || order.payload?.beat_name || "Market Area";
  const salesman = order.salesman_name || order.payload?.salesman_name || "Sales Rep";
  const orderNum = order.orderNumber || order.order_number || "NEW";
  const grandTotal = Number(order.grand_total || order.payload?.grand_total || 0).toFixed(2);
  const items = order.items || order.payload?.items || [];

  let itemsText = "";
  if (Array.isArray(items) && items.length > 0) {
    items.forEach((it, idx) => {
      const name = it.item_name || it.name || "Product";
      const qty = it.quantity || 1;
      const unit = it.unit || "PCS";
      const rate = Number(it.rate || it.selling_rate || 0).toFixed(2);
      const amount = Number(it.amount || (qty * rate)).toFixed(2);
      itemsText += `${idx + 1}. *${name}*\n   └ ${qty} ${unit} × ₹${rate} = ₹${amount}\n`;
    });
  } else {
    itemsText = "• आयटम तपशील सुरक्षित नोंदवला आहे.\n";
  }

  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  const timeStr = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
`🌾 *GAAVBILLING - ऑर्डर पावती (Order Receipt)*
━━━━━━━━━━━━━━━━━━
🏪 *दुकान:* ${retailer}
📍 *बीट:* ${beat}
👤 *सेल्समन:* ${salesman}
🧾 *ऑर्डर क्र:* #${orderNum}
📅 *तारीख:* ${dateStr}, ${timeStr}

*ऑर्डर केलेले आयटम्स (Items):*
${itemsText}━━━━━━━━━━━━━━━━━━
💰 *एकूण रक्कम (Grand Total):* *₹${grandTotal}*
🚚 *डिलिव्हरी:* पुढील फेरीमध्ये
━━━━━━━━━━━━━━━━━━
धन्यवाद! 🙏
_गाव बिलिंग • Developed by Om Vilas Shinde_`
  );
}

export function openWhatsAppReceipt(phone, order) {
  if (!phone) {
    alert("किराणा दुकानदाराचा मोबाईल नंबर उपलब्ध नाही (No phone number available).");
    return;
  }
  const cleanPhone = String(phone).replace(/[^0-9]/g, "");
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const message = formatWhatsAppReceipt(order);
  const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

  if (Platform.OS === "web") {
    window.open(url, "_blank");
  } else {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(() => {
        window.open(url, "_blank");
      });
  }
}
