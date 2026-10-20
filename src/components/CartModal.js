import React, { useState, useEffect } from "react";
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
import { COLORS } from "../theme/colors";

export default function CartModal({
  visible,
  onClose,
  cartItems = [],
  retailer,
  salesman,
  beat,
  totals,
  onUpdateQty,
  onRemoveItem,
  onSubmitOrder,
  isSubmitting,
  editingOrder = null
}) {
  const [notes, setNotes] = useState("");
  // Local string state per product ID so typing and backspacing to "" NEVER causes row to disappear
  const [qtyInputs, setQtyInputs] = useState({});

  useEffect(() => {
    if (visible) {
      const initial = {};
      cartItems.forEach(it => {
        initial[it.id] = String(it.quantity || 0);
      });
      setQtyInputs(initial);

      if (editingOrder && editingOrder.notes) {
        // Strip automated bracket tags for clean user notes editing
        const cleanNote = editingOrder.notes
          .replace(/\[(?:Revised Order|REPLACED BY|SUPERSEDED BY)[^\]]*\]/gi, "")
          .trim();
        setNotes(cleanNote);
      } else {
        setNotes("");
      }
    }
  }, [visible, editingOrder]);

  const handleQtyChange = (itemId, text) => {
    const clean = text.replace(/[^0-9]/g, "");
    setQtyInputs(prev => ({
      ...prev,
      [itemId]: clean
    }));

    const numVal = clean === "" ? 0 : parseInt(clean, 10);
    if (onUpdateQty) {
      onUpdateQty(itemId, isNaN(numVal) ? 0 : numVal);
    }
  };

  const handleStep = (itemId, delta) => {
    const currentStr = qtyInputs[itemId];
    const current = currentStr !== undefined ? parseInt(currentStr, 10) : 0;
    const nextVal = Math.max(0, (isNaN(current) ? 0 : current) + delta);
    setQtyInputs(prev => ({
      ...prev,
      [itemId]: String(nextVal)
    }));
    if (onUpdateQty) {
      onUpdateQty(itemId, nextVal);
    }
  };

  const handleRemove = (itemId) => {
    setQtyInputs(prev => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
    if (onRemoveItem) {
      onRemoveItem(itemId);
    } else if (onUpdateQty) {
      onUpdateQty(itemId, 0, true);
    }
  };

  const handleSend = () => {
    if (!retailer) {
      alert("Please select a retailer store before submitting the order.");
      return;
    }
    // Filter items that have quantity > 0
    const validItems = cartItems.filter(i => {
      const raw = qtyInputs[i.id];
      const q = raw !== undefined && raw !== "" ? parseInt(raw, 10) : Number(i.quantity);
      return !isNaN(q) && q > 0;
    });

    if (!validItems || validItems.length === 0) {
      alert("Your order has no items with quantity greater than 0. Please enter quantities before submitting.");
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
                {editingOrder ? "✏️ Edit & Re-send Order" : "Review & Dispatch Order"}
              </Text>
              <Text style={styles.sheetSubtitle}>
                {cartItems.length} {cartItems.length === 1 ? "Product" : "Products"} • {retailer?.shop_name || "Select Kirana"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Edit Order Warning Notice if revising an existing order */}
          {editingOrder && (
            <View style={styles.revisingBanner}>
              <View style={styles.revisingRow}>
                <Text style={styles.revisingIcon}>⚠️</Text>
                <View style={styles.revisingTextCol}>
                  <Text style={styles.revisingBannerTitle}>
                    Revising Order #{editingOrder.order_number}
                  </Text>
                  <Text style={styles.revisingBannerSub}>
                    Submitting this will replace previous order #{editingOrder.order_number} on desktop.
                  </Text>
                </View>
              </View>
            </View>
          )}

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Retailer Card */}
            <View style={styles.retailerCard}>
              <View style={styles.retailerTop}>
                <Text style={styles.retailerLabel}>DELIVERY STORE / KIRANA</Text>
                <Text style={styles.salesmanTag}>👤 {salesman?.name || "Salesman"}</Text>
              </View>
              <Text style={styles.shopName}>{retailer?.shop_name || "No retailer selected"}</Text>
              <Text style={styles.shopSub}>
                {retailer?.contact_person ? `${retailer.contact_person} • ` : ""}{retailer?.address || "Market Address"}
              </Text>
              <Text style={styles.shopPhone}>📞 {retailer?.phone || "No phone"}</Text>
            </View>

            {/* Items List */}
            <View style={styles.itemsSection}>
              <View style={styles.itemsHeaderRow}>
                <Text style={styles.sectionHeader}>ORDER ITEMS</Text>
                <Text style={styles.itemsHeaderHint}>Type directly or use + / −</Text>
              </View>

              {cartItems.map((item, index) => {
                const rawInput = qtyInputs[item.id];
                const displayValue = rawInput !== undefined ? rawInput : String(item.quantity || "");
                const numericQty = rawInput !== undefined && rawInput !== ""
                  ? (parseInt(rawInput, 10) || 0)
                  : (Number(item.quantity) || 0);

                const rate = Number(item.selling_rate || item.rate || 0);
                const lineTaxable = rate * numericQty;
                const lineTotal = lineTaxable * (1 + Number(item.tax_rate || 0) / 100);

                return (
                  <View key={item.id || index} style={styles.itemRow}>
                    <View style={styles.itemLeft}>
                      <Text style={styles.itemName} numberOfLines={2}>
                        {item.name}
                      </Text>
                      <Text style={styles.itemMeta}>
                        ₹{rate.toFixed(2)} / {item.unit || "PCS"} • {item.tax_rate}% GST
                      </Text>
                    </View>

                    <View style={styles.itemRight}>
                      {/* Stepper with controlled direct typing - Row NEVER vanishes on backspace! */}
                      <View style={styles.stepperMini}>
                        <TouchableOpacity
                          style={styles.miniBtn}
                          onPress={() => handleStep(item.id, -1)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.miniBtnText}>−</Text>
                        </TouchableOpacity>

                        <TextInput
                          style={styles.miniQtyInput}
                          keyboardType="numeric"
                          selectTextOnFocus
                          value={displayValue}
                          placeholder="0"
                          placeholderTextColor="#879B8F"
                          onChangeText={(text) => handleQtyChange(item.id, text)}
                        />

                        <TouchableOpacity
                          style={[styles.miniBtn, styles.miniAddBtn]}
                          onPress={() => handleStep(item.id, 1)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.miniAddBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>

                      <View style={styles.totalAndTrash}>
                        <Text style={styles.lineTotal}>₹{lineTotal.toFixed(2)}</Text>
                        <TouchableOpacity
                          style={styles.trashBtn}
                          onPress={() => handleRemove(item.id)}
                          activeOpacity={0.7}
                          title="Remove Item"
                        >
                          <Text style={styles.trashText}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Order Notes */}
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>ORDER NOTES / INSTRUCTIONS</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="e.g. Deliver before 2 PM, Cash on Delivery, etc."
                placeholderTextColor="#879B8F"
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
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Text style={styles.sendBtnIcon}>⚡</Text>
                  <Text style={styles.sendBtnText}>
                    {editingOrder
                      ? `CONFIRM & RE-SUBMIT (₹${totals.grand_total.toFixed(2)})`
                      : `CONFIRM & DISPATCH ORDER (₹${totals.grand_total.toFixed(2)})`}
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
    backgroundColor: "rgba(11, 37, 24, 0.65)",
    justifyContent: "flex-end"
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
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
    borderBottomColor: COLORS.borderLight
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.primary
  },
  sheetSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2
  },
  closeBtn: {
    backgroundColor: COLORS.surfaceAlt,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textMuted
  },
  revisingBanner: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#fde68a"
  },
  revisingRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  revisingIcon: {
    fontSize: 18,
    marginRight: 8
  },
  revisingTextCol: {
    flex: 1
  },
  revisingBannerTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#92400e"
  },
  revisingBannerSub: {
    fontSize: 11,
    color: "#b45309",
    marginTop: 1
  },
  scrollArea: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24
  },
  retailerCard: {
    backgroundColor: COLORS.surfaceAlt,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.primaryLight,
    letterSpacing: 0.5
  },
  salesmanTag: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primary
  },
  shopName: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 2
  },
  shopSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 2
  },
  shopPhone: {
    fontSize: 11,
    color: COLORS.primaryLight
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
    color: COLORS.primary,
    letterSpacing: 0.5
  },
  itemsHeaderHint: {
    fontSize: 10,
    color: COLORS.primaryLight,
    fontWeight: "600"
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight
  },
  itemLeft: {
    flex: 1,
    marginRight: 10
  },
  itemName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 2
  },
  itemMeta: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  itemRight: {
    alignItems: "flex-end"
  },
  stepperMini: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 4,
    overflow: "hidden"
  },
  miniBtn: {
    backgroundColor: COLORS.surfaceAlt,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center"
  },
  miniBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textDark
  },
  miniAddBtn: {
    backgroundColor: COLORS.primary
  },
  miniAddBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff"
  },
  miniQtyInput: {
    minWidth: 44,
    height: 28,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primaryDark,
    backgroundColor: "#ffffff",
    paddingHorizontal: 2
  },
  totalAndTrash: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  lineTotal: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary
  },
  trashBtn: {
    backgroundColor: COLORS.dangerBg,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  trashText: {
    fontSize: 11,
    fontWeight: "bold",
    color: COLORS.danger
  },
  notesSection: {
    marginBottom: 16
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6
  },
  notesInput: {
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textDark,
    minHeight: 46
  },
  totalsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    color: COLORS.textMuted
  },
  totalValue: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textDark
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.primary
  },
  cloudNotice: {
    backgroundColor: COLORS.primaryWash,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16
  },
  cloudNoticeText: {
    fontSize: 11,
    color: COLORS.primaryLight,
    lineHeight: 16,
    textAlign: "center",
    fontWeight: "600"
  },
  footerContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    backgroundColor: COLORS.surface
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: COLORS.primary,
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
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.3
  }
});
