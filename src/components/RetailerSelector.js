import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput
} from "react-native";

export default function RetailerSelector({
  retailers,
  selectedRetailer,
  onSelectRetailer,
  currentBeat
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");

  const filteredRetailers = retailers.filter(r => {
    const matchesBeat = !currentBeat || r.beat_name === currentBeat;
    const matchesSearch =
      !search ||
      r.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.contact_person?.toLowerCase().includes(search.toLowerCase()) ||
      r.phone?.includes(search);
    return matchesBeat && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>RETAILER (STORE)</Text>
          <Text style={styles.changeAction}>Tap to Change ▾</Text>
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
              <Text style={styles.contactPerson}>
                👤 {selectedRetailer.contact_person || "Proprietor"} • 📞 {selectedRetailer.phone || "No Phone"}
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
              <Text style={styles.modalTitle}>Select Retailer / Kirana</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search store name, person, phone..."
              placeholderTextColor="#94a3b8"
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
                      <Text style={styles.itemShopName}>{item.shop_name}</Text>
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
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
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
    color: "#64748b",
    letterSpacing: 0.5
  },
  changeAction: {
    fontSize: 11,
    color: "#2563eb",
    fontWeight: "600"
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
    fontWeight: "700",
    color: "#0f172a",
    flex: 1
  },
  metaRow: {
    marginBottom: 6
  },
  contactPerson: {
    fontSize: 12,
    color: "#475569"
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  beatBadge: {
    fontSize: 11,
    color: "#0284c7",
    fontWeight: "600"
  },
  dueBadge: {
    backgroundColor: "#fef2f2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#fecaca"
  },
  dueBadgeText: {
    fontSize: 11,
    color: "#dc2626",
    fontWeight: "700"
  },
  clearBadge: {
    backgroundColor: "#f0fdf4",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#bbf7d0"
  },
  clearBadgeText: {
    fontSize: 11,
    color: "#16a34a",
    fontWeight: "700"
  },
  unselectedContainer: {
    paddingVertical: 8,
    alignItems: "center"
  },
  unselectedText: {
    fontSize: 13,
    color: "#2563eb",
    fontWeight: "700"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    padding: 16
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a"
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
  searchInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0f172a",
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
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9"
  },
  selectedItem: {
    backgroundColor: "#eff6ff"
  },
  itemMain: {
    flex: 1,
    marginRight: 12
  },
  itemShopName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2
  },
  itemSub: {
    fontSize: 11,
    color: "#64748b",
    marginBottom: 2
  },
  itemPhone: {
    fontSize: 11,
    color: "#0284c7"
  },
  itemRight: {
    alignItems: "flex-end"
  },
  listDueText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#dc2626"
  },
  listClearText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#16a34a"
  },
  checkMark: {
    fontSize: 16,
    color: "#2563eb",
    fontWeight: "bold",
    marginTop: 4
  },
  emptyView: {
    padding: 24,
    alignItems: "center"
  },
  emptyText: {
    fontSize: 13,
    color: "#94a3b8"
  }
});
