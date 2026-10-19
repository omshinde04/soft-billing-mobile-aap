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
  orders,
  onSyncOffline,
  isSyncing
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
            renderItem={({ item }) => (
              <View style={styles.orderCard}>
                <View style={styles.orderTop}>
                  <Text style={styles.orderNum}>#{item.order_number}</Text>
                  <View
                    style={[
                      styles.statusPill,
                      item.status === "Dispatched"
                        ? styles.statusDispatched
                        : styles.statusOffline
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        item.status === "Dispatched"
                          ? styles.statusTextDispatched
                          : styles.statusTextOffline
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
                </View>

                <View style={styles.bottomRow}>
                  <Text style={styles.itemCountText}>
                    {item.items?.length || 0} Products
                  </Text>
                  <Text style={styles.grandTotalText}>
                    ₹{Number(item.grand_total || 0).toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
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
    borderColor: "#e2e8f0"
  },
  orderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4
  },
  orderNum: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2563eb"
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
  shopName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4
  },
  metaRow: {
    marginBottom: 8
  },
  metaText: {
    fontSize: 11,
    color: "#64748b"
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
    fontSize: 12,
    color: "#475569"
  },
  grandTotalText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#16a34a"
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
