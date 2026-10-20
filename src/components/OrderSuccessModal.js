import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { Check, MessageSquare, Plus } from "lucide-react";
import { COLORS } from "../theme/colors";
import { openWhatsAppReceipt } from "../services/whatsappService";

export default function OrderSuccessModal({
  visible,
  onClose,
  result
}) {
  if (!result) return null;

  const phone = result.payload?.retailer_phone;
  const retailerName = result.payload?.retailer_name || "Kirana Store";
  const grandTotal = Number(result.payload?.grand_total || 0).toFixed(2);
  const itemCount = result.payload?.items?.length || 0;

  const handleSendWhatsApp = () => {
    openWhatsAppReceipt(phone, result);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Animated check circle */}
          <View style={[styles.iconCircle, result.isOffline && styles.iconCircleOffline]}>
            <Check size={32} color="#ffffff" strokeWidth={3} />
          </View>

          <Text style={styles.title}>
            {result.isOffline ? "Order Saved in Phone!" : "Order Dispatched!"}
          </Text>

          <Text style={styles.subtitle}>
            {result.isOffline
              ? "Saved in phone offline queue. Will auto-sync to Desktop when network returns."
              : "Dispatched in real-time to Desktop Master Billing SQLite."}
          </Text>

          {/* Details Box */}
          <View style={styles.detailsBox}>
            <View style={styles.row}>
              <Text style={styles.label}>Order Number</Text>
              <Text style={styles.valueHighlight}>#{result.orderNumber}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Kirana Store</Text>
              <Text style={styles.value} numberOfLines={1}>{retailerName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Items Booked</Text>
              <Text style={styles.value}>{itemCount} {itemCount === 1 ? "Product" : "Products"}</Text>
            </View>
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalValue}>₹{grandTotal}</Text>
            </View>
          </View>

          {/* Action 1: WhatsApp Receipt Button */}
          {phone ? (
            <TouchableOpacity
              style={styles.whatsAppBtn}
              onPress={handleSendWhatsApp}
              activeOpacity={0.85}
            >
              <MessageSquare size={18} color="#ffffff" />
              <View style={styles.whatsAppTextContainer}>
                <Text style={styles.whatsAppBtnText}>WHATSAPP RECEIPT</Text>
                <Text style={styles.whatsAppSubText}>पावती पाठवा • {phone}</Text>
              </View>
            </TouchableOpacity>
          ) : null}

          {/* Action 2: Next Order */}
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Plus size={16} color={COLORS.primary} />
            <Text style={styles.actionBtnText}>BOOK NEXT ORDER</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(11, 37, 24, 0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14
  },
  iconCircleOffline: {
    backgroundColor: COLORS.accentGold
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.primary,
    marginBottom: 4,
    textAlign: "center"
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 17,
    marginBottom: 16
  },
  detailsBox: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    padding: 14,
    width: "100%",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6
  },
  label: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  value: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textDark
  },
  valueHighlight: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.primary
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primary
  },
  totalValue: {
    fontSize: 17,
    fontWeight: "900",
    color: COLORS.primary
  },
  whatsAppBtn: {
    backgroundColor: "#16A34A",
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 10,
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3
  },
  whatsAppTextContainer: {
    alignItems: "flex-start"
  },
  whatsAppBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5
  },
  whatsAppSubText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 10,
    fontWeight: "600"
  },
  actionBtn: {
    backgroundColor: COLORS.primaryWash,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: "100%",
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  actionBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5
  }
});
