import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity
} from "react-native";
import {
  ClipboardList,
  CheckCircle,
  Clock,
  Edit3,
  RefreshCw,
  MessageSquare
} from "lucide-react";
import { COLORS } from "../theme/colors";
import { openWhatsAppReceipt } from "../services/whatsappService";

export default function OrdersScreen({
  orders = [],
  onEditOrder,
  onSyncOffline,
  isSyncing = false,
  onStartNewOrder
}) {
  const [filter, setFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);

  const filteredOrders = orders.filter((o) => {
    if (filter === "synced") return o.synced === true || o.status === "synced";
    if (filter === "pending") return !o.synced && o.status !== "synced";
    return true;
  });

  const totalValue = orders.reduce((sum, o) => sum + (Number(o.grand_total) || 0), 0);
  const pendingCount = orders.filter((o) => !o.synced && o.status !== "synced").length;

  return (
    <View style={styles.container}>
      {/* Summary KPI Banner */}
      <View style={styles.kpiCard}>
        <View style={styles.kpiLeft}>
          <Text style={styles.kpiLabel}>आजचे एकूण बुकिंग (Today's Booking)</Text>
          <Text style={styles.kpiValue}>₹{totalValue.toFixed(2)}</Text>
          <Text style={styles.kpiSub}>
            {orders.length} {orders.length === 1 ? "Order" : "Orders"} Placed
          </Text>
        </View>

        {pendingCount > 0 && (
          <TouchableOpacity
            style={styles.syncPendingBtn}
            onPress={onSyncOffline}
            disabled={isSyncing}
            activeOpacity={0.8}
          >
            <RefreshCw size={14} color="#ffffff" />
            <Text style={styles.syncPendingText}>
              {isSyncing ? "Syncing..." : `SYNC ${pendingCount} ⚡`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterPill, filter === "all" && styles.activeFilterPill]}
          onPress={() => setFilter("all")}
        >
          <Text style={[styles.filterText, filter === "all" && styles.activeFilterText]}>
            सर्व ऑर्डर्स ({orders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filter === "synced" && styles.activeFilterPill]}
          onPress={() => setFilter("synced")}
        >
          <Text style={[styles.filterText, filter === "synced" && styles.activeFilterText]}>
            ⚡ Synced ({orders.length - pendingCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filter === "pending" && styles.activeFilterPill]}
          onPress={() => setFilter("pending")}
        >
          <Text style={[styles.filterText, filter === "pending" && styles.activeFilterText]}>
            ⏳ In Phone ({pendingCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item, index) => item.order_number || String(index)}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const isSynced = item.synced === true || item.status === "synced";
          const isExpanded = expandedOrder === item.order_number;
          const itemsList = Array.isArray(item.items) ? item.items : [];

          return (
            <View style={styles.orderCard}>
              <TouchableOpacity
                style={styles.orderHeader}
                onPress={() => setExpandedOrder(isExpanded ? null : item.order_number)}
                activeOpacity={0.7}
              >
                <View style={styles.orderHeaderLeft}>
                  <View style={styles.orderNumberRow}>
                    <Text style={styles.orderNumber}>#{item.order_number}</Text>
                    {item.is_revision && (
                      <View style={styles.revisionBadge}>
                        <Text style={styles.revisionText}>REVISED</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.retailerName} numberOfLines={1}>
                    🏪 {item.retailer_name || "Kirana Store"}
                  </Text>
                  <Text style={styles.beatName}>
                    📍 {item.beat_name || "Market Beat"} • {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                  </Text>
                </View>

                <View style={styles.orderHeaderRight}>
                  <Text style={styles.orderTotal}>₹{Number(item.grand_total || 0).toFixed(2)}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      isSynced ? styles.statusPillSynced : styles.statusPillPending
                    ]}
                  >
                    {isSynced ? (
                      <CheckCircle size={10} color={COLORS.primaryLight} />
                    ) : (
                      <Clock size={10} color="#B45309" />
                    )}
                    <Text
                      style={[
                        styles.statusPillText,
                        isSynced ? styles.textSynced : styles.textPending
                      ]}
                    >
                      {isSynced ? "Synced" : "In Phone"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Items Breakdown on Expand */}
              {isExpanded && (
                <View style={styles.expandedContent}>
                  <Text style={styles.itemsHeader}>Items in this order:</Text>
                  {itemsList.map((it, idx) => (
                    <View key={idx} style={styles.itemRow}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {it.item_name || it.name}
                      </Text>
                      <Text style={styles.itemQty}>
                        {it.quantity} {it.unit || "PCS"} × ₹{Number(it.rate || it.selling_rate || 0).toFixed(2)}
                      </Text>
                      <Text style={styles.itemTotal}>
                        ₹{Number(it.amount || ((it.quantity || 1) * (it.rate || it.selling_rate || 0))).toFixed(2)}
                      </Text>
                    </View>
                  ))}

                  {item.notes && (
                    <Text style={styles.notesText}>📝 Notes: {item.notes}</Text>
                  )}
                </View>
              )}

              {/* Card Footer Actions */}
              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.detailsToggle}
                  onPress={() => setExpandedOrder(isExpanded ? null : item.order_number)}
                >
                  <Text style={styles.detailsToggleText}>
                    {isExpanded ? "Hide Details ▲" : `View ${itemsList.length} Items ▼`}
                  </Text>
                </TouchableOpacity>

                <View style={styles.footerActionsRight}>
                  {/* WhatsApp Receipt Share Button */}
                  <TouchableOpacity
                    style={styles.whatsAppOrderBtn}
                    onPress={() => openWhatsAppReceipt(item.retailer_phone, item)}
                    activeOpacity={0.8}
                  >
                    <MessageSquare size={13} color="#15803D" />
                    <Text style={styles.whatsAppOrderText}>WhatsApp</Text>
                  </TouchableOpacity>

                  {/* Edit / Revise Button */}
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => onEditOrder(item)}
                    activeOpacity={0.8}
                  >
                    <Edit3 size={13} color={COLORS.primary} />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <ClipboardList size={40} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>अद्याप कोणतीही ऑर्डर नोंदवली नाही</Text>
            <Text style={styles.emptySub}>No orders recorded today yet.</Text>
            <TouchableOpacity
              style={styles.newOrderBtn}
              onPress={onStartNewOrder}
              activeOpacity={0.85}
            >
              <Text style={styles.newOrderBtnText}>+ BOOK NEW ORDER</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  kpiCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4
  },
  kpiLeft: {
    flex: 1
  },
  kpiLabel: {
    fontSize: 11,
    color: COLORS.primarySoft,
    fontWeight: "600"
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#ffffff",
    marginTop: 2
  },
  kpiSub: {
    fontSize: 11,
    color: COLORS.accentGold,
    fontWeight: "700",
    marginTop: 2
  },
  syncPendingBtn: {
    backgroundColor: COLORS.accentAmber,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  syncPendingText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900"
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 8
  },
  filterPill: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  activeFilterPill: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  filterText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted
  },
  activeFilterText: {
    color: "#ffffff"
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80
  },
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  orderHeaderLeft: {
    flex: 1,
    marginRight: 8
  },
  orderNumberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  orderNumber: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.primary
  },
  revisionBadge: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#FDE68A"
  },
  revisionText: {
    color: "#B45309",
    fontSize: 8,
    fontWeight: "900"
  },
  retailerName: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textDark,
    marginTop: 2
  },
  beatName: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2
  },
  orderHeaderRight: {
    alignItems: "flex-end"
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.textDark
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4
  },
  statusPillSynced: {
    backgroundColor: COLORS.primarySoft
  },
  statusPillPending: {
    backgroundColor: COLORS.accentLight
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: "800"
  },
  textSynced: {
    color: COLORS.primaryLight
  },
  textPending: {
    color: "#B45309"
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    marginTop: 10,
    paddingTop: 8
  },
  itemsHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
    marginBottom: 6
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 3
  },
  itemName: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textDark,
    flex: 1
  },
  itemQty: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginHorizontal: 8
  },
  itemTotal: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textDark
  },
  notesText: {
    fontSize: 10,
    fontStyle: "italic",
    color: COLORS.textMuted,
    marginTop: 6
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    marginTop: 8,
    paddingTop: 8
  },
  detailsToggle: {
    paddingVertical: 4
  },
  detailsToggleText: {
    fontSize: 11,
    color: COLORS.primaryLight,
    fontWeight: "700"
  },
  footerActionsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  whatsAppOrderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#86EFAC"
  },
  whatsAppOrderText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#15803D"
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.primaryWash,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.primary
  },
  emptyBox: {
    paddingVertical: 60,
    alignItems: "center"
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textDark,
    marginTop: 12
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 16
  },
  newOrderBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10
  },
  newOrderBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800"
  }
});
