import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList
} from "react-native";
import { COLORS } from "../theme/colors";

export default function RetailerSelector({
  retailers = [],
  selectedRetailer,
  onSelectRetailer,
  currentBeat
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");

  const filteredRetailers = useMemo(() => {
    return retailers.filter(r => {
      const matchBeat = !currentBeat || r.beat_name === currentBeat;
      const matchSearch =
        !search ||
        r.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.contact_person?.toLowerCase().includes(search.toLowerCase()) ||
        r.phone?.includes(search);
      return matchBeat && matchSearch;
    });
  }, [retailers, currentBeat, search]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>DELIVERY STORE / KIRANA</Text>
          <Text style={styles.changeAction}>Change Store ▾</Text>
        </View>

        {selectedRetailer ? (
          <View style={styles.retailerInfo}>
            <View style={styles.storeNameRow}>
              <Text style={styles.storeIcon}>🏪</Text>
              <Text style={styles.storeName} numberOfLines={1}>
                {selectedRetailer.shop_name}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.contactPerson} numberOfLines={1}>
                👤 {selectedRetailer.contact_person || "Kirana Owner"} • 📞 {selectedRetailer.phone || "No Phone"}
              </Text>
            </View>
            <View style={styles.bottomRow}>
              <Text style={styles.beatBadge}>📍 {selectedRetailer.beat_name || "General Beat"}</Text>
              {Number(selectedRetailer.outstanding_balance) > 0 ? (
                <View style={styles.dueBadge}>
                  <Text style={styles.dueBadgeText}>
                    Due: ₹{Number(selectedRetailer.outstanding_balance).toLocaleString()}
                  </Text>
                </View>
              ) : (
                <View style={styles.clearBadge}>
                  <Text style={styles.clearBadgeText}>✓ No Dues</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.unselectedContainer}>
            <Text style={styles.unselectedText}>👉 Tap here to select Kirana / Store</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Modal for choosing retailer */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Delivery Store / Kirana</Text>
                <Text style={styles.modalSubtitle}>Filtered by route: {currentBeat || "All Beats"}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="🔍 Search shop name, contact, phone..."
              placeholderTextColor="#879B8F"
              value={search}
              onChangeText={setSearch}
            />

            <FlatList
              data={filteredRetailers}
              keyExtractor={item => String(item.id)}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => {
                const isSelected = selectedRetailer?.id === item.id;
                return (
                  <TouchableOpacity
                    style={[styles.retailerItem, isSelected && styles.selectedItem]}
                    onPress={() => {
                      onSelectRetailer(item);
                      setModalVisible(false);
                    }}
                  >
                    <View style={styles.itemMain}>
                      <Text style={[styles.itemShopName, isSelected && styles.itemShopNameSelected]}>
                        {item.shop_name}
                      </Text>
                      <Text style={styles.itemSub}>
                        {item.contact_person} • {item.address}
                      </Text>
                      <Text style={styles.itemPhone}>📞 {item.phone}</Text>
                    </View>
                    <View style={styles.itemRight}>
                      {Number(item.outstanding_balance) > 0 ? (
                        <Text style={styles.listDueText}>
                          Due ₹{Number(item.outstanding_balance).toLocaleString()}
                        </Text>
                      ) : (
                        <Text style={styles.listClearText}>✓ Clear</Text>
                      )}
                      {isSelected && <Text style={styles.checkMark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyView}>
                  <Text style={styles.emptyText}>No retailers found for beat: {currentBeat}</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.primaryLight,
    letterSpacing: 0.5
  },
  changeAction: {
    fontSize: 11,
    color: COLORS.primaryLight,
    fontWeight: "700"
  },
  retailerInfo: {},
  storeNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4
  },
  storeIcon: {
    fontSize: 16,
    marginRight: 6
  },
  storeName: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.primary,
    flex: 1
  },
  metaRow: {
    marginBottom: 6
  },
  contactPerson: {
    fontSize: 12,
    color: COLORS.textMuted
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  beatBadge: {
    fontSize: 11,
    color: COLORS.primaryLight,
    fontWeight: "600"
  },
  dueBadge: {
    backgroundColor: COLORS.dangerBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#fecaca"
  },
  dueBadgeText: {
    fontSize: 11,
    color: COLORS.danger,
    fontWeight: "700"
  },
  clearBadge: {
    backgroundColor: COLORS.primaryWash,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  clearBadgeText: {
    fontSize: 11,
    color: COLORS.primaryLight,
    fontWeight: "700"
  },
  unselectedContainer: {
    paddingVertical: 8,
    alignItems: "center"
  },
  unselectedText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "700"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(11, 37, 24, 0.6)",
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "82%",
    padding: 16
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.primary
  },
  modalSubtitle: {
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
  searchInput: {
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textDark,
    marginBottom: 12
  },
  listContent: {
    paddingBottom: 24
  },
  retailerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight
  },
  selectedItem: {
    backgroundColor: COLORS.primaryWash,
    borderWidth: 1,
    borderColor: COLORS.primaryLight
  },
  itemMain: {
    flex: 1,
    marginRight: 12
  },
  itemShopName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 2
  },
  itemShopNameSelected: {
    color: COLORS.primary
  },
  itemSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 2
  },
  itemPhone: {
    fontSize: 11,
    color: COLORS.primaryLight
  },
  itemRight: {
    alignItems: "flex-end"
  },
  listDueText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.danger
  },
  listClearText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.primaryLight
  },
  checkMark: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: "bold",
    marginTop: 4
  },
  emptyView: {
    padding: 24,
    alignItems: "center"
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted
  }
});
