import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator
} from "react-native";

export default function RecentOrdersModal({
  visible,
  onClose,
  orders = [],
  onSyncOffline,
  isSyncing,
  onEditOrder
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Orders History</Text>
              <Text style={styles.subtitle}>Recent orders recorded on this phone</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Sync Offline Banner */}
          <View style={styles.syncBanner}>
            <View style={styles.syncTextCol}>
              <Text style={styles.syncBannerTitle}>Basement / Offline Sync</Text>
              <Text style={styles.syncBannerSub}>Push queued offline orders to cloud</Text>
            </View>
            <TouchableOpacity
              style={styles.syncBtn}
              onPress={onSyncOffline}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.syncBtnText}>🔄 Sync</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* List */}
          <FlatList
            data={orders}
            keyExtractor={(item, idx) => item.order_number || String(idx)}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isOffline = item.status === "Offline Queued";
              const isDispatched = item.status === "Dispatched";
              const isRevised = item.status === "Revised / Re-sent";

              return (
                <View style={styles.orderCard}>
                  <View style={styles.orderTop}>
                    <View style={styles.orderNumRow}>
                      <Text style={styles.orderNum}>#{item.order_number}</Text>
                      {item.is_edited && (
                        <View style={styles.editedBadge}>
                          <Text style={styles.editedBadgeText}>EDITED</Text>
                        </View>
                      )}
                    </View>
                    <View
                      style={[
                        styles.statusPill,
                        isDispatched
                          ? styles.statusDispatched
                          : isOffline
                          ? styles.statusOffline
                          : styles.statusRevised
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          isDispatched
                            ? styles.statusTextDispatched
                            : isOffline
                            ? styles.statusTextOffline
                            : styles.statusTextRevised
                        ]}
                      >
                        {item.status || "Dispatched"}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.shopName}>{item.retailer_name}</Text>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>
                      👤 {item.salesman_name} • 📍 {item.beat_name || "Market"}
                    </Text>
                    {item.notes ? (
                      <Text style={styles.notesText} numberOfLines={1}>
                        💬 {item.notes}
                      </Text>
                    ) : null}
                  </View>

                  {/* Items summary list */}
                  {Array.isArray(item.items) && item.items.length > 0 && (
                    <View style={styles.itemsPreview}>
                      {item.items.slice(0, 3).map((it, idx) => (
                        <Text key={idx} style={styles.previewLine} numberOfLines={1}>
                          • {it.product_name || it.name} × {it.quantity}
                        </Text>
                      ))}
                      {item.items.length > 3 && (
                        <Text style={styles.moreItemsText}>
                          + {item.items.length - 3} more items
                        </Text>
                      )}
                    </View>
                  )}

                  <View style={styles.bottomRow}>
                    <View>
                      <Text style={styles.itemCountText}>
                        {item.items?.length || 0} Products
                      </Text>
                      <Text style={styles.grandTotalText}>
                        ₹{Number(item.grand_total || 0).toFixed(2)}
                      </Text>
                    </View>

                    {/* Edit Order Action */}
                    {onEditOrder && (
                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => onEditOrder(item)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.editBtnText}>✏️ Edit & Re-send</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyView}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>No orders booked yet</Text>
                <Text style={styles.emptySub}>
                  Orders booked in the market will appear here.
                </Text>
              </View>
            }
          />
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
  container: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "85%",
    padding: 16
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a"
  },
  subtitle: {
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
  syncBanner: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 12
  },
  syncTextCol: {
    flex: 1,
    marginRight: 8
  },
  syncBannerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a"
  },
  syncBannerSub: {
    fontSize: 11,
    color: "#64748b"
  },
  syncBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  syncBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700"
  },
  listContent: {
    paddingBottom: 24
  },
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  orderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  orderNumRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  orderNum: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2563eb"
  },
  editedBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4
  },
  editedBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#b45309"
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12
  },
  statusDispatched: {
    backgroundColor: "#ecfdf5"
  },
  statusOffline: {
    backgroundColor: "#fef3c7"
  },
  statusRevised: {
    backgroundColor: "#f1f5f9"
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700"
  },
  statusTextDispatched: {
    color: "#059669"
  },
  statusTextOffline: {
    color: "#d97706"
  },
  statusTextRevised: {
    color: "#64748b"
  },
  shopName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4
  },
  metaRow: {
    marginBottom: 6
  },
  metaText: {
    fontSize: 11,
    color: "#64748b"
  },
  notesText: {
    fontSize: 11,
    color: "#0284c7",
    fontStyle: "italic",
    marginTop: 2
  },
  itemsPreview: {
    backgroundColor: "#f8fafc",
    padding: 8,
    borderRadius: 6,
    marginBottom: 8
  },
  previewLine: {
    fontSize: 11,
    color: "#475569",
    marginBottom: 2
  },
  moreItemsText: {
    fontSize: 10,
    color: "#94a3b8",
    fontStyle: "italic"
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 8
  },
  itemCountText: {
    fontSize: 11,
    color: "#64748b"
  },
  grandTotalText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#16a34a"
  },
  editBtn: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  editBtnText: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "700"
  },
  emptyView: {
    paddingVertical: 48,
    alignItems: "center"
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4
  },
  emptySub: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center"
  }
});
