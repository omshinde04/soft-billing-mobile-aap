import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";

export default function ProductCard({
  product,
  quantity = 0,
  onIncrement,
  onDecrement,
  onSetQuantity
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempQty, setTempQty] = useState(String(quantity));

  const rate = Number(product.selling_rate || product.rate || 0);
  const mrp = Number(product.mrp || rate);
  const marginPct = mrp > rate ? Math.round(((mrp - rate) / mrp) * 100) : 0;
  const taxRate = Number(product.tax_rate || 0);

  const handleFinishEditing = () => {
    setIsEditing(false);
    const parsed = parseInt(tempQty, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      if (onSetQuantity) onSetQuantity(product.id, parsed);
    } else {
      setTempQty(String(quantity));
    }
  };

  const handleQuickAdd = (amount) => {
    const current = Number(quantity || 0);
    const next = current + amount;
    if (onSetQuantity) {
      onSetQuantity(product.id, next);
    }
  };

  return (
    <View style={[styles.card, quantity > 0 && styles.activeCard]}>
      <View style={styles.topInfo}>
        <View style={styles.nameBlock}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={styles.badgeRow}>
            {product.brand ? (
              <View style={styles.brandBadge}>
                <Text style={styles.brandBadgeText}>{product.brand}</Text>
              </View>
            ) : null}
            <View style={styles.taxBadge}>
              <Text style={styles.taxBadgeText}>{taxRate}% GST</Text>
            </View>
            {product.unit ? (
              <Text style={styles.unitText}>
                {product.pack_size ? product.pack_size + " " : ""}{product.unit}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Stepper with Direct Numeric Input */}
        <View style={styles.actionBlock}>
          {quantity > 0 ? (
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={onDecrement}
                activeOpacity={0.7}
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </TouchableOpacity>

              {/* Direct Numeric Input / Touch to Type */}
              {isEditing ? (
                <TextInput
                  style={styles.qtyInput}
                  keyboardType="numeric"
                  autoFocus
                  selectTextOnFocus
                  value={tempQty}
                  onChangeText={setTempQty}
                  onBlur={handleFinishEditing}
                  onSubmitEditing={handleFinishEditing}
                />
              ) : (
                <TouchableOpacity
                  style={styles.qtyBox}
                  onPress={() => {
                    setTempQty(String(quantity));
                    setIsEditing(true);
                  }}
                  activeOpacity={0.7}
                  title="Tap to type quantity directly"
                >
                  <Text style={styles.qtyText}>{quantity}</Text>
                  <Text style={styles.qtyEditHint}>edit</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.stepperBtn, styles.stepperAddBtn]}
                onPress={onIncrement}
                activeOpacity={0.7}
              >
                <Text style={styles.stepperAddBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={onIncrement}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>+ ADD</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Pricing row & Quick Multipliers */}
      <View style={styles.pricingRow}>
        <View style={styles.priceLeft}>
          <Text style={styles.rateLabel}>Wholesale:</Text>
          <Text style={styles.rateValue}>₹{rate.toFixed(2)}</Text>
          {mrp > rate && (
            <Text style={styles.mrpCrossed}>₹{mrp.toFixed(2)}</Text>
          )}
          {marginPct > 0 && (
            <View style={styles.marginPill}>
              <Text style={styles.marginPillText}>{marginPct}% Margin</Text>
            </View>
          )}
        </View>

        {/* Quick Multiplier Case Pills: +6, +12, +24 */}
        <View style={styles.quickMultipliers}>
          <TouchableOpacity
            style={styles.quickPill}
            onPress={() => handleQuickAdd(6)}
            activeOpacity={0.7}
          >
            <Text style={styles.quickPillText}>+6</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickPill}
            onPress={() => handleQuickAdd(12)}
            activeOpacity={0.7}
          >
            <Text style={styles.quickPillText}>+12</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickPill}
            onPress={() => handleQuickAdd(24)}
            activeOpacity={0.7}
          >
            <Text style={styles.quickPillText}>+24</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1
  },
  activeCard: {
    borderColor: "#3b82f6",
    backgroundColor: "#f8faff"
  },
  topInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8
  },
  nameBlock: {
    flex: 1,
    marginRight: 12
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
    lineHeight: 18
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  brandBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4
  },
  brandBadgeText: {
    fontSize: 10,
    color: "#475569",
    fontWeight: "600"
  },
  taxBadge: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "#a7f3d0"
  },
  taxBadgeText: {
    fontSize: 10,
    color: "#059669",
    fontWeight: "700"
  },
  unitText: {
    fontSize: 11,
    color: "#64748b"
  },
  actionBlock: {
    alignItems: "flex-end"
  },
  addButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800"
  },
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    overflow: "hidden"
  },
  stepperBtn: {
    backgroundColor: "#f1f5f9",
    width: 32,
    height: 34,
    alignItems: "center",
    justifyContent: "center"
  },
  stepperBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#475569"
  },
  stepperAddBtn: {
    backgroundColor: "#2563eb"
  },
  stepperAddBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff"
  },
  qtyBox: {
    minWidth: 42,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center"
  },
  qtyText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0f172a"
  },
  qtyEditHint: {
    fontSize: 8,
    color: "#3b82f6",
    fontWeight: "700",
    marginTop: -2
  },
  qtyInput: {
    minWidth: 42,
    height: 34,
    paddingHorizontal: 4,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "900",
    color: "#0f172a",
    backgroundColor: "#eff6ff"
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 8
  },
  priceLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  rateLabel: {
    fontSize: 11,
    color: "#64748b"
  },
  rateValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a"
  },
  mrpCrossed: {
    fontSize: 11,
    color: "#94a3b8",
    textDecorationLine: "line-through"
  },
  marginPill: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  marginPillText: {
    fontSize: 10,
    color: "#2563eb",
    fontWeight: "700"
  },
  quickMultipliers: {
    flexDirection: "row",
    gap: 4
  },
  quickPill: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0"
  },
  quickPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569"
  }
});
