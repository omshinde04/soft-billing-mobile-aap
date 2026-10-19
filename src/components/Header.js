import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function Header({
  salesmen,
  currentSalesman,
  onSelectSalesman,
  beats,
  currentBeat,
  onSelectBeat,
  onOpenRecent,
  onRefreshCatalog,
  isRefreshing
}) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <View>
          <View style={styles.titleRow}>
            <View style={styles.boltBadge}>
              <Text style={styles.boltText}>⚡</Text>
            </View>
            <Text style={styles.appTitle}>Billing-Soft</Text>
            <View style={styles.mobileBadge}>
              <Text style={styles.mobileBadgeText}>FIELD APP</Text>
            </View>
          </View>
          <Text style={styles.appSubtitle}>FMCG Salesman Order Booking</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onRefreshCatalog}
            disabled={isRefreshing}
          >
            <Text style={styles.iconButtonText}>{isRefreshing ? "⏳" : "🔄"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, styles.historyButton]}
            onPress={onOpenRecent}
          >
            <Text style={styles.iconButtonText}>📋</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Salesman & Beat Pill Bar */}
      <View style={styles.filterRow}>
        {/* Salesman selector */}
        <View style={styles.selectorPill}>
          <Text style={styles.pillLabel}>Salesman:</Text>
          <TouchableOpacity
            onPress={() => {
              const idx = salesmen.findIndex(s => s.id === currentSalesman?.id);
              const next = salesmen[(idx + 1) % salesmen.length];
              onSelectSalesman(next);
            }}
            style={styles.pillTouch}
          >
            <Text style={styles.pillValue} numberOfLines={1}>
              {currentSalesman?.name || "Select"} ▾
            </Text>
          </TouchableOpacity>
        </View>

        {/* Beat selector */}
        <View style={styles.selectorPill}>
          <Text style={styles.pillLabel}>Beat:</Text>
          <TouchableOpacity
            onPress={() => {
              const idx = beats.indexOf(currentBeat);
              const next = beats[(idx + 1) % beats.length];
              onSelectBeat(next);
            }}
            style={styles.pillTouch}
          >
            <Text style={styles.pillValue} numberOfLines={1}>
              {currentBeat || "All Beats"} ▾
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#0f172a",
    paddingTop: 45,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b"
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  boltBadge: {
    backgroundColor: "#f59e0b",
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8
  },
  boltText: {
    fontSize: 16,
    fontWeight: "bold"
  },
  appTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.3
  },
  mobileBadge: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.4)"
  },
  mobileBadgeText: {
    color: "#60a5fa",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  appSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8
  },
  iconButton: {
    backgroundColor: "#1e293b",
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#334155"
  },
  historyButton: {
    backgroundColor: "#1e293b"
  },
  iconButtonText: {
    fontSize: 16
  },
  filterRow: {
    flexDirection: "row",
    gap: 8
  },
  selectorPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155"
  },
  pillLabel: {
    fontSize: 11,
    color: "#94a3b8",
    marginRight: 4,
    fontWeight: "600"
  },
  pillTouch: {
    flex: 1
  },
  pillValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#38bdf8"
  }
});
