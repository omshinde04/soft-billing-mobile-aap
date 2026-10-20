import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator
} from "react-native";

export default function CartModal({
  visible,
  onClose,
  cartItems = [],
  retailer,
  salesman,
  beat,
  totals,
  onUpdateQty,
  onSubmitOrder,
  isSubmitting,
  editingOrder = null
}) {
  const [notes, setNotes] = useState("");

  const handleSend = () => {
    if (!retailer) {
      alert("Please select a retailer store before submitting the order.");
      return;
    }
    if (!cartItems || cartItems.length === 0) {
      alert("Your cart is empty. Add at least one item.");
      return;
    }
    onSubmitOrder({ notes });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>
                {editingOrder ? "✏️ Edit & Re-send Order" : "Review & Send Order"}
              </Text>
              <Text style={styles.sheetSubtitle}>
                {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"} • {retailer?.shop_name || "No Retailer"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Edit Order Warning Notice if revising an existing order */}
          {editingOrder && (
            <View style={styles.revisingBanner}>
              <Text style={styles.revisingBannerTitle}>
                ⚠️ Revising Order #{editingOrder.order_number}
              </Text>
              <Text style={styles.revisingBannerSub}>
                Any modifications made here will replace the previous order when submitted.
              </Text>
            </View>
          )}

          <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
            {/* Retailer Card */}
            <View style={styles.retailerCard}>
              <View style={styles.retailerTop}>
                <Text style={styles.retailerLabel}>DELIVERY STORE</Text>
                <Text style={styles.salesmanTag}>Taken by: {salesman?.name || "Salesman"}</Text>
              </View>
              <Text style={styles.shopName}>{retailer?.shop_name || "No retailer selected"}</Text>
              <Text style={styles.shopSub}>
                {retailer?.contact_person} • {retailer?.address}
              </Text>
              <Text style={styles.shopPhone}>📞 {retailer?.phone}</Text>
            </View>

            {/* Items List */}
            <View style={styles.itemsSection}>
              <View style={styles.itemsHeaderRow}>
                <Text style={styles.sectionHeader}>ORDER ITEMS</Text>
                <Text style={styles.itemsHeaderHint}>Tap quantity box to type directly</Text>
              </View>
              {cartItems.map((item, index) => {
                const rate = Number(item.selling_rate || item.rate || 0);
                const lineTaxable = rate * item.quantity;
                const lineTotal = lineTaxable * (1 + Number(item.tax_rate || 0) / 100);

                return (
                  <View key={item.id || index} style={styles.itemRow}>
                    <View style={styles.itemLeft}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemMeta}>
                        ₹{rate.toFixed(2)} / {item.unit || "PCS"} • {item.tax_rate}% GST
                      </Text>
                    </View>

                    <View style={styles.itemRight}>
                      <View style={styles.stepperMini}>
                        <TouchableOpacity
                          style={styles.miniBtn}
                          onPress={() => onUpdateQty(item.id, item.quantity - 1)}
                        >
                          <Text style={styles.miniBtnText}>−</Text>
                        </TouchableOpacity>

                        {/* Direct Numeric Input inside Cart */}
                        <TextInput
                          style={styles.miniQtyInput}
                          keyboardType="numeric"
                          selectTextOnFocus
                          defaultValue={String(item.quantity)}
                          onEndEditing={(e) => {
                            const val = parseInt(e.nativeEvent.text, 10);
                            if (!isNaN(val) && val >= 0) {
                              onUpdateQty(item.id, val);
                            }
                          }}
                        />

                        <TouchableOpacity
                          style={[styles.miniBtn, styles.miniAddBtn]}
                          onPress={() => onUpdateQty(item.id, item.quantity + 1)}
                        >
                          <Text style={styles.miniAddBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.lineTotal}>₹{lineTotal.toFixed(2)}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Order Notes */}
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>ORDER NOTES / SPECIAL INSTRUCTIONS</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="e.g. Urgent delivery by 1 PM, Cash on Delivery, etc."
                placeholderTextColor="#94a3b8"
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </View>

            {/* Financial Totals Card */}
            <View style={styles.totalsCard}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Taxable Subtotal</Text>
                <Text style={styles.totalValue}>₹{totals.subtotal_taxable.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>CGST</Text>
                <Text style={styles.totalValue}>₹{totals.total_cgst.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>SGST</Text>
                <Text style={styles.totalValue}>₹{totals.total_sgst.toFixed(2)}</Text>
              </View>
              <View style={[styles.totalRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>Grand Total</Text>
                <Text style={styles.grandTotalValue}>₹{totals.grand_total.toFixed(2)}</Text>
              </View>
            </View>

            {/* Zero cloud notice */}
            <View style={styles.cloudNotice}>
              <Text style={styles.cloudNoticeText}>
                🔒 100% Private: Order reaches your desktop SQLite instantly and deletes itself from the cloud.
              </Text>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footerContainer}>
            <TouchableOpacity
              style={[styles.sendBtn, isSubmitting && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Text style={styles.sendBtnIcon}>⚡</Text>
                  <Text style={styles.sendBtnText}>
                    {editingOrder
                      ? `RE-SUBMIT REVISED ORDER (₹${totals.grand_total.toFixed(2)})`
                      : `SEND ORDER TO DESKTOP (₹${totals.grand_total.toFixed(2)})`}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end"
  },
  sheetContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "90%",
    display: "flex",
    flexDirection: "column"
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9"
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a"
  },
  sheetSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2
  },
  closeBtn: {
    backgroundColor: "#f1f5f9",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b"
  },
  revisingBanner: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#fde68a"
  },
  revisingBannerTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#92400e"
  },
  revisingBannerSub: {
    fontSize: 11,
    color: "#b45309",
    marginTop: 2
  },
  scrollArea: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24
  },
  retailerCard: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16
  },
  retailerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  retailerLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.5
  },
  salesmanTag: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2563eb"
  },
  shopName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2
  },
  shopSub: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 2
  },
  shopPhone: {
    fontSize: 11,
    color: "#0284c7"
  },
  itemsSection: {
    marginBottom: 16
  },
  itemsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.5
  },
  itemsHeaderHint: {
    fontSize: 10,
    color: "#3b82f6",
    fontWeight: "600"
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9"
  },
  itemLeft: {
    flex: 1,
    marginRight: 10
  },
  itemName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2
  },
  itemMeta: {
    fontSize: 11,
    color: "#64748b"
  },
  itemRight: {
    alignItems: "flex-end"
  },
  stepperMini: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    marginBottom: 4,
    overflow: "hidden"
  },
  miniBtn: {
    backgroundColor: "#f1f5f9",
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center"
  },
  miniBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569"
  },
  miniAddBtn: {
    backgroundColor: "#2563eb"
  },
  miniAddBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff"
  },
  miniQtyInput: {
    minWidth: 34,
    height: 28,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "800",
    color: "#0f172a",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 2
  },
  lineTotal: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a"
  },
  notesSection: {
    marginBottom: 16
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.5,
    marginBottom: 6
  },
  notesInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: "#0f172a",
    minHeight: 50
  },
  totalsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    marginBottom: 14
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6
  },
  totalLabel: {
    fontSize: 12,
    color: "#64748b"
  },
  totalValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a"
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a"
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "900",
    color: "#16a34a"
  },
  cloudNotice: {
    backgroundColor: "#f0fdf4",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    marginBottom: 16
  },
  cloudNoticeText: {
    fontSize: 11,
    color: "#166534",
    lineHeight: 16,
    textAlign: "center"
  },
  footerContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    backgroundColor: "#ffffff"
  },
  sendBtn: {
    backgroundColor: "#16a34a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4
  },
  sendBtnDisabled: {
    backgroundColor: "#94a3b8"
  },
  sendBtnIcon: {
    fontSize: 18,
    color: "#ffffff",
    marginRight: 6
  },
  sendBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.3
  }
});
