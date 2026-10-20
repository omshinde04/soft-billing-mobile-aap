import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image
} from "react-native";
import { COLORS } from "../theme/colors";

export default function Header({
  salesmen = [],
  currentSalesman,
  onSelectSalesman,
  beats = [],
  currentBeat,
  onSelectBeat,
  isOfflineMode,
  onToggleOfflineMode,
  offlineQueueCount = 0,
  onRefreshCatalog,
  isRefreshing,
  onOpenRecent,
  onLogout
}) {
  return (
    <View style={styles.headerContainer}>
      {/* Top Brand & Mode Bar */}
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <View style={styles.logoFrame}>
            <Image
              source={require("../../assets/gaavbilling-logo.jpg")}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          <View>
            <View style={styles.titleWithBadge}>
              <Text style={styles.appTitle}>GaavBilling</Text>
              <View style={styles.mobileBadge}>
                <Text style={styles.mobileBadgeText}>FIELD APP</Text>
              </View>
            </View>
            <Text style={styles.appSubtitle}>गाव बिलिंग • FMCG Order Booking</Text>
          </View>
        </View>

        {/* Action Buttons: Network Mode, Sync & Orders History */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.modeButton, isOfflineMode ? styles.modeOffline : styles.modeOnline]}
            onPress={onToggleOfflineMode}
            activeOpacity={0.7}
            title={isOfflineMode ? "Switch to Online Mode" : "Simulate Basement Offline Mode"}
          >
            <Text style={[styles.modeButtonText, isOfflineMode ? styles.modeOfflineText : styles.modeOnlineText]}>
              {isOfflineMode ? "📵 Basement" : "🟢 Online"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={onRefreshCatalog}
            disabled={isRefreshing}
            title="Refresh Catalog from Desktop"
          >
            <Text style={styles.iconButtonText}>{isRefreshing ? "⏳" : "🔄"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, styles.historyButton]}
            onPress={onOpenRecent}
            title="Orders History"
          >
            <Text style={styles.iconButtonText}>📋</Text>
            {offlineQueueCount > 0 && (
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{offlineQueueCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Logged-in Salesman Profile Card */}
      {currentSalesman && (
        <View style={styles.salesmanProfileCard}>
          <View style={styles.profileLeft}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {currentSalesman.name ? currentSalesman.name.charAt(0).toUpperCase() : "S"}
              </Text>
            </View>
            <View style={styles.salesmanInfo}>
              <View style={styles.salesmanNameRow}>
                <Text style={styles.salesmanName} numberOfLines={1}>
                  {currentSalesman.name}
                </Text>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>FIELD SALESMAN</Text>
                </View>
              </View>
              <Text style={styles.salesmanPhone}>
                📞 {currentSalesman.phone || "No phone"} • 🆔 {currentSalesman.login_id || "ID"}
              </Text>
            </View>
          </View>

          {/* Logout Button */}
          {onLogout && (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={onLogout}
              activeOpacity={0.7}
              title="Logout Salesman"
            >
              <Text style={styles.logoutButtonText}>🚪 Logout</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Route & Beat Selector Row */}
      <View style={styles.filterRow}>
        <View style={styles.selectorPill}>
          <Text style={styles.pillLabel}>📍 Beat / Route:</Text>
          <TouchableOpacity
            onPress={() => {
              if (beats.length === 0) return;
              const idx = beats.indexOf(currentBeat);
              const next = beats[(idx + 1) % beats.length];
              onSelectBeat(next);
            }}
            style={styles.pillTouch}
          >
            <Text style={styles.pillValue} numberOfLines={1}>
              {currentBeat || "All Market Beats"} ▾
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === "ios" ? 14 : (Platform.OS === "android" ? 38 : 16),
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryDark
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  logoFrame: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
    padding: 2,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: COLORS.primarySoft,
    overflow: "hidden"
  },
  logoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 17
  },
  titleWithBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  appTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -0.3
  },
  mobileBadge: {
    backgroundColor: "rgba(216, 243, 220, 0.2)",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(216, 243, 220, 0.4)"
  },
  mobileBadgeText: {
    color: COLORS.primarySoft,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  appSubtitle: {
    fontSize: 10,
    color: COLORS.primarySoft,
    marginTop: 1,
    fontWeight: "500"
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  modeButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1
  },
  modeOnline: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.3)"
  },
  modeOffline: {
    backgroundColor: "rgba(244, 162, 97, 0.25)",
    borderColor: "rgba(244, 162, 97, 0.6)"
  },
  modeButtonText: {
    fontSize: 11,
    fontWeight: "800"
  },
  modeOnlineText: {
    color: "#ffffff"
  },
  modeOfflineText: {
    color: COLORS.accentGold
  },
  iconButton: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    position: "relative"
  },
  historyButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)"
  },
  iconButtonText: {
    fontSize: 14
  },
  badgeCount: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: COLORS.accent,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center"
  },
  badgeCountText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900"
  },
  salesmanProfileCard: {
    backgroundColor: "rgba(11, 37, 24, 0.5)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 8
  },
  profileLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800"
  },
  salesmanInfo: {
    flex: 1
  },
  salesmanNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  salesmanName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff"
  },
  roleBadge: {
    backgroundColor: "rgba(64, 145, 108, 0.4)",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4
  },
  roleBadgeText: {
    color: COLORS.primarySoft,
    fontSize: 8,
    fontWeight: "800"
  },
  salesmanPhone: {
    fontSize: 10,
    color: COLORS.primarySoft,
    marginTop: 1
  },
  logoutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)"
  },
  logoutButtonText: {
    color: "#fca5a5",
    fontSize: 11,
    fontWeight: "700"
  },
  filterRow: {
    flexDirection: "row"
  },
  selectorPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(11, 37, 24, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)"
  },
  pillLabel: {
    fontSize: 11,
    color: COLORS.primarySoft,
    marginRight: 6,
    fontWeight: "600"
  },
  pillTouch: {
    flex: 1
  },
  pillValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff"
  }
});
