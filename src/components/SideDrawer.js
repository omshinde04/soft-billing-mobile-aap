import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform
} from "react-native";
import {
  X,
  User,
  MapPin,
  RefreshCw,
  LogOut,
  Radio,
  Store,
  ClipboardList,
  Sparkles
} from "lucide-react";
import { COLORS } from "../theme/colors";

export default function SideDrawer({
  visible,
  onClose,
  salesman,
  beats = [],
  currentBeat,
  onSelectBeat,
  isOfflineMode,
  onToggleOfflineMode,
  offlineQueueCount = 0,
  onSyncOffline,
  isSyncing,
  onLogout,
  onNavigateTab
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.drawerCard}>
          {/* Drawer Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.brandRow}>
              <View style={styles.brandIconBox}>
                <Sparkles size={18} color={COLORS.accentGold} />
              </View>
              <View>
                <Text style={styles.brandTitle}>GaavBilling</Text>
                <Text style={styles.brandSub}>गाव बिलिंग मेनू</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.drawerBody} showsVerticalScrollIndicator={false}>
            {/* Salesman Profile Card */}
            {salesman && (
              <View style={styles.profileSection}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {salesman.name ? salesman.name.charAt(0).toUpperCase() : "S"}
                  </Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.salesmanName}>{salesman.name}</Text>
                  <Text style={styles.salesmanRole}>FIELD SALES REPRESENTATIVE</Text>
                  <Text style={styles.salesmanPhone}>📞 {salesman.phone || "No phone"}</Text>
                  <Text style={styles.salesmanId}>ID: #{salesman.login_id || "9"}</Text>
                </View>
              </View>
            )}

            {/* Beat / Market Route Selector */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MapPin size={16} color={COLORS.primaryLight} />
                <Text style={styles.sectionTitle}>निवडलेला बीट (Active Beat)</Text>
              </View>

              <View style={styles.beatsList}>
                {beats.map((beat) => {
                  const isSelected = currentBeat === beat;
                  return (
                    <TouchableOpacity
                      key={beat}
                      style={[
                        styles.beatItem,
                        isSelected && styles.activeBeatItem
                      ]}
                      onPress={() => {
                        onSelectBeat(beat);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.beatItemText,
                          isSelected && styles.activeBeatItemText
                        ]}
                      >
                        {isSelected ? "✓ " : "• "} {beat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Offline Basement Mode Toggle */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Radio size={16} color={COLORS.primaryLight} />
                <Text style={styles.sectionTitle}>नेटवर्क मोड (Network Mode)</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.toggleCard,
                  isOfflineMode ? styles.toggleCardOffline : styles.toggleCardOnline
                ]}
                onPress={onToggleOfflineMode}
                activeOpacity={0.8}
              >
                <View>
                  <Text style={styles.toggleCardTitle}>
                    {isOfflineMode ? "📵 Basement Mode (Offline)" : "🟢 Real-time Cloud (Online)"}
                  </Text>
                  <Text style={styles.toggleCardSub}>
                    {isOfflineMode
                      ? "Orders save to phone storage first"
                      : "Direct real-time sync with Desktop"}
                  </Text>
                </View>
                <View style={[styles.switchPill, isOfflineMode && styles.switchPillActive]}>
                  <Text style={styles.switchPillText}>
                    {isOfflineMode ? "OFFLINE" : "ONLINE"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Cloud Sync Status */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <RefreshCw size={16} color={COLORS.primaryLight} />
                <Text style={styles.sectionTitle}>डेस्कटॉप सिंक (Desktop Sync)</Text>
              </View>

              <View style={styles.syncCard}>
                <View style={styles.syncCardRow}>
                  <Text style={styles.syncStatusLabel}>फोनमध्ये साठवलेल्या ऑर्डर्स:</Text>
                  <View style={styles.queueCountBadge}>
                    <Text style={styles.queueCountText}>{offlineQueueCount}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.syncBtn,
                    offlineQueueCount === 0 && styles.syncBtnDisabled
                  ]}
                  onPress={onSyncOffline}
                  disabled={isSyncing}
                  activeOpacity={0.85}
                >
                  <Text style={styles.syncBtnText}>
                    {isSyncing ? "सिंक चालू आहे..." : "⚡ SYNC TO DESKTOP NOW"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Navigation Links */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Store size={16} color={COLORS.primaryLight} />
                <Text style={styles.sectionTitle}>जलद पर्याय (Quick Links)</Text>
              </View>

              <TouchableOpacity
                style={styles.navLink}
                onPress={() => {
                  onClose();
                  if (onNavigateTab) onNavigateTab("stores");
                }}
              >
                <Store size={18} color={COLORS.primaryLight} />
                <Text style={styles.navLinkText}>सर्व किराणा दुकाने (All Kirana Stores)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.navLink}
                onPress={() => {
                  onClose();
                  if (onNavigateTab) onNavigateTab("orders");
                }}
              >
                <ClipboardList size={18} color={COLORS.primaryLight} />
                <Text style={styles.navLinkText}>आजच्या ऑर्डर्स (Today's Orders)</Text>
              </TouchableOpacity>
            </View>

            {/* Developer Attribution Card */}
            <View style={styles.devCard}>
              <Text style={styles.devTitle}>GaavBilling • गाव बिलिंग</Text>
              <Text style={styles.devSub}>FMCG Rural & Urban Sales Automation</Text>
              <View style={styles.devDivider} />
              <Text style={styles.devCredit}>
                Developed with pride by <Text style={styles.devAuthor}>Om Vilas Shinde</Text>
              </Text>
              <Text style={styles.devDistrict}>📍 Nashik District, Maharashtra</Text>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => {
                onClose();
                if (onLogout) onLogout();
              }}
              activeOpacity={0.8}
            >
              <LogOut size={16} color="#DC2626" />
              <Text style={styles.logoutBtnText}>लॉगआउट करा (Logout)</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  backdrop: {
    flex: 1
  },
  drawerCard: {
    width: "82%",
    maxWidth: 360,
    backgroundColor: COLORS.background,
    height: "100%",
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20
  },
  drawerHeader: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === "ios" ? 48 : 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  brandIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center"
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#ffffff"
  },
  brandSub: {
    fontSize: 11,
    color: COLORS.primarySoft,
    fontWeight: "600"
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center"
  },
  drawerBody: {
    flex: 1,
    padding: 16
  },
  profileSection: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900"
  },
  profileInfo: {
    flex: 1
  },
  salesmanName: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textDark
  },
  salesmanRole: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.primaryLight,
    letterSpacing: 0.5,
    marginTop: 1
  },
  salesmanPhone: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2
  },
  salesmanId: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: "600"
  },
  section: {
    marginBottom: 18
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 0.3
  },
  beatsList: {
    gap: 6
  },
  beatItem: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  activeBeatItem: {
    backgroundColor: COLORS.primaryWash,
    borderColor: COLORS.primaryLight
  },
  beatItemText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted
  },
  activeBeatItemText: {
    color: COLORS.primary,
    fontWeight: "800"
  },
  toggleCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  toggleCardOnline: {
    backgroundColor: "#ffffff",
    borderColor: COLORS.border
  },
  toggleCardOffline: {
    backgroundColor: COLORS.accentLight,
    borderColor: "#FDE68A"
  },
  toggleCardTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textDark
  },
  toggleCardSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2
  },
  switchPill: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  switchPillActive: {
    backgroundColor: COLORS.accentAmber
  },
  switchPillText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900"
  },
  syncCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  syncCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  syncStatusLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600"
  },
  queueCountBadge: {
    backgroundColor: COLORS.accentGold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10
  },
  queueCountText: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: "900"
  },
  syncBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center"
  },
  syncBtnDisabled: {
    opacity: 0.75
  },
  syncBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  navLink: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6
  },
  navLinkText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textDark
  },
  devCard: {
    backgroundColor: COLORS.primaryWash,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    marginVertical: 12
  },
  devTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary
  },
  devSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1
  },
  devDivider: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 6
  },
  devCredit: {
    fontSize: 11,
    color: COLORS.textDark
  },
  devAuthor: {
    fontWeight: "800",
    color: COLORS.primaryLight
  },
  devDistrict: {
    fontSize: 9,
    color: COLORS.textLight,
    marginTop: 2
  },
  logoutBtn: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 32
  },
  logoutBtnText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "800"
  }
});
