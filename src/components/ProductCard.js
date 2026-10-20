import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput
} from "react-native";
import { COLORS } from "../theme/colors";

export default function ProductCard({
  product,
  quantity = 0,
  onIncrement,
  onDecrement,
  onSetQuantity
}) {
  const [inputText, setInputText] = useState(quantity > 0 ? String(quantity) : "");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setInputText(quantity > 0 ? String(quantity) : "");
    }
  }, [quantity, isFocused]);

  const rate = Number(product.selling_rate || product.rate || 0);
  const mrp = Number(product.mrp || rate);
  const marginPct = mrp > rate ? Math.round(((mrp - rate) / mrp) * 100) : 0;
  const taxRate = Number(product.tax_rate || 0);

  const handleTextChange = (text) => {
    const clean = text.replace(/[^0-9]/g, "");
    setInputText(clean);
    const val = clean === "" ? 0 : parseInt(clean, 10);
    if (!isNaN(val) && onSetQuantity) {
      onSetQuantity(product.id, val);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const val = parseInt(inputText || "0", 10);
    if (isNaN(val) || val <= 0) {
      setInputText("");
      if (onSetQuantity) onSetQuantity(product.id, 0);
    } else {
      setInputText(String(val));
      if (onSetQuantity) onSetQuantity(product.id, val);
    }
  };

  const handleQuickAdd = (amount) => {
    const current = Number(quantity || 0);
    const next = current + amount;
    setInputText(String(next));
    if (onSetQuantity) {
      onSetQuantity(product.id, next);
    }
  };

  return (
    <View style={[styles.card, (quantity > 0 || isFocused) && styles.activeCard]}>
      {/* Top Details & Action Block */}
      <View style={styles.topRow}>
        <View style={styles.infoCol}>
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
            <Text style={styles.unitText}>
              {product.pack_size ? `${product.pack_size} ` : ""}{product.unit || "PCS"}
            </Text>
          </View>
        </View>

        {/* Quantity Stepper & Direct Typing Input */}
        <View style={styles.actionCol}>
          {quantity > 0 || isFocused ? (
            <View style={styles.stepperBox}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={onDecrement}
                activeOpacity={0.7}
              >
                <Text style={styles.stepBtnText}>−</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.qtyInput}
                keyboardType="numeric"
                selectTextOnFocus
                value={inputText}
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
                onChangeText={handleTextChange}
                placeholder="0"
                placeholderTextColor="#879B8F"
              />

              <TouchableOpacity
                style={[styles.stepBtn, styles.stepAddBtn]}
                onPress={onIncrement}
                activeOpacity={0.7}
              >
                <Text style={styles.stepAddBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={onIncrement}
              activeOpacity={0.8}
            >
              <Text style={styles.addBtnText}>+ ADD</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Bottom Pricing Row & Quick Bulk Multipliers */}
      <View style={styles.bottomRow}>
        <View style={styles.priceBlock}>
          <Text style={styles.rateLabel}>Rate:</Text>
          <Text style={styles.rateValue}>₹{rate.toFixed(2)}</Text>
          {mrp > rate && (
            <Text style={styles.mrpCrossed}>₹{mrp.toFixed(2)}</Text>
          )}
          {marginPct > 0 && (
            <View style={styles.marginBadge}>
              <Text style={styles.marginText}>{marginPct}% Margin</Text>
            </View>
          )}
        </View>

        {/* Quick Multiplier Pills */}
        <View style={styles.bulkRow}>
          <TouchableOpacity
            style={styles.bulkPill}
            onPress={() => handleQuickAdd(6)}
            activeOpacity={0.7}
          >
            <Text style={styles.bulkText}>+6</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bulkPill}
            onPress={() => handleQuickAdd(12)}
            activeOpacity={0.7}
          >
            <Text style={styles.bulkText}>+12</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bulkPill}
            onPress={() => handleQuickAdd(24)}
            activeOpacity={0.7}
          >
            <Text style={styles.bulkText}>+24</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1
  },
  activeCard: {
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.primaryWash
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10
  },
  infoCol: {
    flex: 1,
    marginRight: 12
  },
  productName: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 4,
    lineHeight: 18
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  brandBadge: {
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4
  },
  brandBadgeText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "700"
  },
  taxBadge: {
    backgroundColor: COLORS.primaryWash,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: COLORS.border
  },
  taxBadgeText: {
    fontSize: 10,
    color: COLORS.primaryLight,
    fontWeight: "700"
  },
  unitText: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  actionCol: {
    alignItems: "flex-end"
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2
  },
  addBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  stepperBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    overflow: "hidden"
  },
  stepBtn: {
    backgroundColor: COLORS.surfaceAlt,
    width: 32,
    height: 34,
    alignItems: "center",
    justifyContent: "center"
  },
  stepBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary
  },
  stepAddBtn: {
    backgroundColor: COLORS.primary
  },
  stepAddBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff"
  },
  qtyInput: {
    minWidth: 44,
    height: 34,
    paddingHorizontal: 4,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.primaryDark,
    backgroundColor: "#ffffff"
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8
  },
  priceBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  rateLabel: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  rateValue: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.primary
  },
  mrpCrossed: {
    fontSize: 11,
    color: COLORS.textLight,
    textDecorationLine: "line-through"
  },
  marginBadge: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  marginText: {
    fontSize: 10,
    color: COLORS.accentAmber,
    fontWeight: "700"
  },
  bulkRow: {
    flexDirection: "row",
    gap: 4
  },
  bulkPill: {
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  bulkText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primaryLight
  }
});
