import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity } from "react-native";

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
          <TouchableOpacity style={styles.actionBtn} onPress={onClose} activeOpacity={0.8}>
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
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16
  },
  iconCircleOffline: {
    backgroundColor: "#f59e0b"
  },
  iconText: {
    fontSize: 32,
    color: "#ffffff",
    fontWeight: "bold"
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 6,
    textAlign: "center"
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16
  },
  detailsBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 14,
    width: "100%",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  label: {
    fontSize: 12,
    color: "#64748b"
  },
  value: {
    fontSize: 12,
    fontWeight: "600",
    color: "#0f172a"
  },
  valueHighlight: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2563eb"
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a"
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#16a34a"
  },
  actionBtn: {
    backgroundColor: "#2563eb",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center"
  },
  actionBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5
  }
});
