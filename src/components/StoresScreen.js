import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Linking
} from "react-native";
import { Store, Phone, MapPin, CheckCircle, AlertTriangle, Search, MessageSquare } from "lucide-react";
import { COLORS } from "../theme/colors";

export default function StoresScreen({
  retailers = [],
  selectedRetailer,
  onSelectRetailer,
  currentBeat,
  onStartOrder
}) {
  const [search, setSearch] = useState("");

  const filteredRetailers = retailers.filter((r) => {
    const matchesBeat = !currentBeat || r.beat_name === currentBeat;
    const matchesSearch =
      !search ||
      r.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.phone?.includes(search);
    return matchesBeat && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.headerBox}>
        <View style={styles.searchBar}>
          <Search size={16} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Kirana store, owner name, mobile..."
            placeholderTextColor={COLORS.textLight}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.beatInfoRow}>
          <Text style={styles.beatInfoText}>
            📍 Beat: <Text style={styles.beatBold}>{currentBeat || "All Beats"}</Text> • {filteredRetailers.length} Stores
          </Text>
        </View>
      </View>

      {/* Stores List */}
      <FlatList
        data={filteredRetailers}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => {
          const isSelected = selectedRetailer && String(selectedRetailer.id) === String(item.id);
          const hasDues = Number(item.outstanding_dues || item.current_balance || 0) > 0;
          const duesAmount = Number(item.outstanding_dues || item.current_balance || 0);

          return (
            <View style={[styles.storeCard, isSelected && styles.selectedStoreCard]}>
              <View style={styles.storeTopRow}>
                <View style={styles.storeIconBox}>
                  <Store size={20} color={isSelected ? COLORS.primary : COLORS.primaryLight} />
                </View>
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>{item.shop_name}</Text>
                  <Text style={styles.ownerText}>
                    👤 {item.owner_name || "Owner"}
                  </Text>
                </View>

                {/* Dues Status Badge */}
                {hasDues ? (
                  <View style={styles.duesBadgeWarning}>
                    <AlertTriangle size={11} color="#B45309" />
                    <Text style={styles.duesTextWarning}>₹{duesAmount.toFixed(0)} Dues</Text>
                  </View>
                ) : (
                  <View style={styles.duesBadgeOk}>
                    <CheckCircle size={11} color={COLORS.primaryLight} />
                    <Text style={styles.duesTextOk}>No Dues</Text>
                  </View>
                )}
              </View>

              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <MapPin size={13} color={COLORS.textLight} />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {item.address || item.beat_name || "Market Area"}
                  </Text>
                </View>

                {item.phone && (
                  <View style={styles.detailRight}>
                    <View style={styles.detailItem}>
                      <Phone size={12} color={COLORS.textLight} />
                      <Text style={styles.detailText}>{item.phone}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.whatsAppStorePill}
                      onPress={() => {
                        const clean = String(item.phone).replace(/[^0-9]/g, "");
                        const formatted = clean.length === 10 ? `91${clean}` : clean;
                        const msg = encodeURIComponent(`नमस्ते ${item.owner_name || item.shop_name}, मी गाव बिलिंग (GaavBilling) प्रतिनिधी संपर्क साधत आहे.`);
                        Linking.openURL(`https://wa.me/${formatted}?text=${msg}`);
                      }}
                      activeOpacity={0.7}
                    >
                      <MessageSquare size={11} color="#15803D" />
                      <Text style={styles.whatsAppStoreText}>WhatsApp</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.selectBtn, isSelected && styles.selectBtnActive]}
                  onPress={() => {
                    onSelectRetailer(item);
                    if (onStartOrder) onStartOrder();
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.selectBtnText, isSelected && styles.selectBtnTextActive]}>
                    {isSelected ? "SELECTED • START ORDER ➔" : "SELECT STORE & BOOK ORDER ➔"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🏪</Text>
            <Text style={styles.emptyTitle}>कोणतेही दुकान सापडले नाही</Text>
            <Text style={styles.emptySub}>No store found matching your search.</Text>
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
  headerBox: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: COLORS.background
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: "500"
  },
  clearBtn: {
    fontSize: 14,
    color: COLORS.textLight,
    paddingHorizontal: 4
  },
  beatInfoRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center"
  },
  beatInfoText: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  beatBold: {
    fontWeight: "800",
    color: COLORS.primary
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80
  },
  storeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2
  },
  selectedStoreCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryWash,
    borderWidth: 1.5
  },
  storeTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8
  },
  storeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryWash,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10
  },
  storeInfo: {
    flex: 1
  },
  storeName: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textDark
  },
  ownerText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2
  },
  duesBadgeOk: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6
  },
  duesTextOk: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.primary
  },
  duesBadgeWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FDE68A"
  },
  duesTextWarning: {
    fontSize: 10,
    fontWeight: "800",
    color: "#B45309"
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingTop: 8,
    marginBottom: 10
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1
  },
  detailRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  detailText: {
    fontSize: 11,
    color: COLORS.textMuted
  },
  whatsAppStorePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#86EFAC"
  },
  whatsAppStoreText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#15803D"
  },
  cardActions: {
    marginTop: 2
  },
  selectBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center"
  },
  selectBtnActive: {
    backgroundColor: COLORS.primaryLight
  },
  selectBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5
  },
  selectBtnTextActive: {
    color: "#ffffff"
  },
  emptyBox: {
    paddingVertical: 60,
    alignItems: "center"
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textDark
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4
  }
});
