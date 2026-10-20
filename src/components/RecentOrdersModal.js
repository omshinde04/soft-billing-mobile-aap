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
import { COLORS } from "../theme/colors";

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
              <Text style={styles.title}>Orders History • मागील ऑर्डर्स</Text>
              <Text style={styles.subtitle}>
                Recent field orders recorded on this phone
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Sync Offline Banner */}
          <View style={styles.syncBanner}>
            <View style={styles.syncTextCol}>
              <Text style={styles.syncBannerTitle}>Basement / Offline Sync</Text>
              <Text style={styles.syncBannerSub}>Push queued offline orders to desktop</Text>
            </View>
            <TouchableOpacity
              style={styles.syncBtn}
              onPress={onSyncOffline}
              disabled={isSyncing}
              activeOpacity={0.8}
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
              const isReplaced = item.is_replaced || item.status === "Replaced" || item.status === "Cancelled" || (item.notes && item.notes.includes("[Replaced by"));
              const isOffline = item.status === "Offline Queued";
              const isRevised = item.is_revision || item.status === "Revised";
              const isDispatched = item.status === "Dispatched" || isRevised;

              return (
                <View style={[styles.orderCard, isReplaced && styles.orderCardReplaced]}>
                  <View style={styles.orderTop}>
                    <View style={styles.orderNumRow}>
                      <Text style={[styles.orderNum, isReplaced && styles.orderNumStrikethrough]}>
                        #{item.order_number}
                      </Text>
                      {item.replaces_order_number && (
                        <View style={styles.revisionPill}>
                          <Text style={styles.revisionPillText}>
                            ✏️ Revised from #{item.replaces_order_number}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Status Pill */}
                    <View
                      style={[
                        styles.statusPill,
                        isReplaced
                          ? styles.statusPillReplaced
                          : isOffline
                          ? styles.statusOffline
                          : styles.statusDispatched
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          isReplaced
                            ? styles.statusTextReplaced
                            : isOffline
                            ? styles.statusTextOffline
                            : styles.statusTextDispatched
                        ]}
                      >
                        {isReplaced
                          ? `Replaced by #${item.replaced_by || "Revised"}`
                          : item.status || "Dispatched"}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.shopName, isReplaced && styles.textMuted]}>
                    {item.retailer_name}
                  </Text>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>
                      👤 {item.salesman_name} • 📍 {item.beat_name || "Market Beat"}
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
                          • {it.item_name || it.product_name || it.name} × {it.quantity}
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
                      <Text style={[styles.grandTotalText, isReplaced && styles.textMuted]}>
                        ₹{Number(item.grand_total || 0).toFixed(2)}
                      </Text>
                    </View>

                    {/* Edit Order Action (Only visible for active, non-superseded orders) */}
                    {!isReplaced && onEditOrder ? (
                      <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => onEditOrder(item)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.editBtnText}>✏️ Edit & Re-send</Text>
                      </TouchableOpacity>
                    ) : isReplaced ? (
                      <View style={styles.supersededBadge}>
                        <Text style={styles.supersededBadgeText}>✓ Superseded</Text>
                      </View>
                    ) : null}
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
    backgroundColor: "rgba(11, 37, 24, 0.65)",
    justifyContent: "flex-end"
  },
  container: {
    backgroundColor: COLORS.surface,
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
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.primary
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1
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
  syncBanner: {
    backgroundColor: COLORS.surfaceAlt,
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12
  },
  syncTextCol: {
    flex: 1,
    marginRight: 8
  },
  syncBannerTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.primary
  },
  syncBannerSub: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  syncBtn: {
    backgroundColor: COLORS.primary,
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
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  orderCardReplaced: {
    backgroundColor: COLORS.surfaceAlt,
    borderColor: COLORS.borderLight,
    opacity: 0.8
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
    color: COLORS.primary
  },
  orderNumStrikethrough: {
    color: COLORS.textLight,
    textDecorationLine: "line-through"
  },
  revisionPill: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4
  },
  revisionPillText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.accentAmber
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12
  },
  statusDispatched: {
    backgroundColor: COLORS.primaryWash
  },
  statusOffline: {
    backgroundColor: COLORS.accentLight
  },
  statusPillReplaced: {
    backgroundColor: COLORS.dangerBg
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700"
  },
  statusTextDispatched: {
    color: COLORS.primaryLight
  },
  statusTextOffline: {
    color: COLORS.accentAmber
  },
  statusTextReplaced: {
    color: COLORS.danger
  },
  shopName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 4
  },
  textMuted: {
    color: COLORS.textLight
  },
  metaRow: {
    marginBottom: 6
  },
  metaText: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  notesText: {
    fontSize: 11,
    color: COLORS.primaryLight,
    fontStyle: "italic",
    marginTop: 2
  },
  itemsPreview: {
    backgroundColor: COLORS.surfaceAlt,
    padding: 8,
    borderRadius: 6,
    marginBottom: 8
  },
  previewLine: {
    fontSize: 11,
    color: COLORS.textDark,
    marginBottom: 2
  },
  moreItemsText: {
    fontSize: 10,
    color: COLORS.textLight,
    fontStyle: "italic"
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8
  },
  itemCountText: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  grandTotalText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary
  },
  editBtn: {
    backgroundColor: COLORS.primaryWash,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  editBtnText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: "700"
  },
  supersededBadge: {
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  supersededBadgeText: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: "600"
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
    color: COLORS.primary,
    marginBottom: 4
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center"
  }
});
