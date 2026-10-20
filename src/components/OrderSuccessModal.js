import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { COLORS } from "../theme/colors";

export default function OrderSuccessModal({
  visible,
  onClose,
  result
}) {
  if (!result) return null;

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
            <Text style={styles.iconText}>{result.isOffline ? "💾" : "✓"}</Text>
          </View>

          <Text style={styles.title}>
            {result.isOffline ? "Order Saved Offline!" : "Order Dispatched!"}
          </Text>

          <Text style={styles.subtitle}>
            {result.isOffline
              ? "No internet in market. Saved locally and will automatically send once connected."
              : "Order delivered to Desktop Master SQLite and erased from cloud."}
          </Text>

          {/* Details Box */}
          <View style={styles.detailsBox}>
            <View style={styles.row}>
              <Text style={styles.label}>Order Number</Text>
              <Text style={styles.valueHighlight}>#{result.orderNumber}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Store</Text>
              <Text style={styles.value}>{result.payload?.retailer_name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Items</Text>
              <Text style={styles.value}>{result.payload?.items?.length} products</Text>
            </View>
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalValue}>₹{Number(result.payload?.grand_total || 0).toFixed(2)}</Text>
            </View>
          </View>

          {/* Action button */}
          <TouchableOpacity style={styles.actionBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.actionBtnText}>+ BOOK ANOTHER ORDER</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(11, 37, 24, 0.7)",
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
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16
  },
  iconCircleOffline: {
    backgroundColor: COLORS.accentGold
  },
  iconText: {
    fontSize: 32,
    color: "#ffffff",
    fontWeight: "bold"
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 6,
    textAlign: "center"
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16
  },
  detailsBox: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 12,
    padding: 14,
    width: "100%",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  label: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  value: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textDark
  },
  valueHighlight: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primaryLight
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
    fontWeight: "700",
    color: COLORS.primary
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.primary
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3
  },
  actionBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5
  }
});
