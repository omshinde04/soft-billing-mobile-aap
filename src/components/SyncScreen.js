import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from "react-native";
import {
  RefreshCw,
  Radio,
  CheckCircle,
  Cloud,
  Database,
  ArrowUpRight,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import { COLORS } from "../theme/colors";

export default function SyncScreen({
  isOfflineMode,
  onToggleOfflineMode,
  offlineQueueCount = 0,
  onSyncOffline,
  isSyncing = false,
  orders = []
}) {
  const syncedCount = orders.filter((o) => o.synced === true || o.status === "synced").length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Cloud Sync Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.iconCircle}>
            <Cloud size={28} color="#ffffff" />
          </View>
          <View style={styles.heroTitles}>
            <Text style={styles.heroTitle}>GaavCloud Real-Time Sync</Text>
            <Text style={styles.heroSub}>
              {isOfflineMode
                ? "📵 Basement Mode Active (Local Storage Only)"
                : "🟢 Connected to Desktop Billing Engine"}
            </Text>
          </View>
        </View>

        {/* Sync Trigger Button */}
        <TouchableOpacity
          style={[
            styles.syncBtn,
            isSyncing && styles.syncBtnDisabled
          ]}
          onPress={onSyncOffline}
          disabled={isSyncing}
          activeOpacity={0.85}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <RefreshCw size={18} color="#ffffff" />
          )}
          <Text style={styles.syncBtnText}>
            {isSyncing ? "SYNCING ORDERS..." : "⚡ SYNC TO DESKTOP NOW"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sync Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{syncedCount}</Text>
          <Text style={styles.statLabel}>Synced with Desktop</Text>
          <View style={styles.statStatus}>
            <CheckCircle size={12} color={COLORS.primaryLight} />
            <Text style={styles.statStatusText}>Verified Live</Text>
          </View>
        </View>

        <View style={styles.statBox}>
          <Text style={[styles.statValue, offlineQueueCount > 0 && { color: COLORS.accentAmber }]}>
            {offlineQueueCount}
          </Text>
          <Text style={styles.statLabel}>Pending in Phone</Text>
          <View style={styles.statStatus}>
            <Database size={12} color={COLORS.accentAmber} />
            <Text style={[styles.statStatusText, { color: COLORS.accentAmber }]}>
              {offlineQueueCount > 0 ? "Needs Sync" : "Clean Storage"}
            </Text>
          </View>
        </View>
      </View>

      {/* Network Mode Toggle Switch */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Radio size={18} color={COLORS.primary} />
          <Text style={styles.cardTitle}>नेटवर्क मोड (Network Selector)</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.modeCard,
            isOfflineMode ? styles.modeCardOffline : styles.modeCardOnline
          ]}
          onPress={onToggleOfflineMode}
          activeOpacity={0.8}
        >
          <View style={styles.modeCardLeft}>
            <Text style={styles.modeCardTitle}>
              {isOfflineMode ? "📵 Basement Mode (Offline)" : "🟢 Live Online Cloud"}
            </Text>
            <Text style={styles.modeCardDesc}>
              {isOfflineMode
                ? "Simulates deep basement/rural network outage. Orders are cached in phone memory safely."
                : "Continuous real-time auto-dispatch to Desktop billing software."}
            </Text>
          </View>

          <View style={[styles.pillToggle, isOfflineMode && styles.pillToggleActive]}>
            <Text style={styles.pillToggleText}>
              {isOfflineMode ? "OFFLINE" : "ONLINE"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Field Distribution Architecture Note */}
      <View style={styles.infoBox}>
        <View style={styles.infoHeader}>
          <ShieldCheck size={16} color={COLORS.primaryLight} />
          <Text style={styles.infoTitle}>Zero Order Loss Guarantee</Text>
        </View>
        <Text style={styles.infoText}>
          Even if your mobile network drops completely inside remote Kirana shops, GaavBilling continues booking orders instantly. As soon as you re-enter 4G/5G coverage, all stored orders automatically flush to the Desktop.
        </Text>
      </View>

      {/* Developer Attribution Footer */}
      <View style={styles.devFooter}>
        <Text style={styles.devTitle}>GaavBilling Engine v1.0</Text>
        <Text style={styles.devText}>
          Designed & Developed by <Text style={styles.devBold}>Om Vilas Shinde</Text>
        </Text>
        <Text style={styles.devSub}>Nashik District • Maharashtra</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  content: {
    padding: 16,
    paddingBottom: 90
  },
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  heroTitles: {
    flex: 1
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#ffffff"
  },
  heroSub: {
    fontSize: 11,
    color: COLORS.primarySoft,
    marginTop: 2,
    fontWeight: "600"
  },
  syncBtn: {
    backgroundColor: COLORS.accentGold,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  syncBtnDisabled: {
    opacity: 0.7
  },
  syncBtnText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.5
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16
  },
  statBox: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2
  },
  statValue: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.primary
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: "600"
  },
  statStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6
  },
  statStatusText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.primaryLight
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primary
  },
  modeCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  modeCardOnline: {
    backgroundColor: COLORS.primaryWash,
    borderColor: COLORS.primaryLight
  },
  modeCardOffline: {
    backgroundColor: COLORS.accentLight,
    borderColor: "#FDE68A"
  },
  modeCardLeft: {
    flex: 1,
    marginRight: 10
  },
  modeCardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textDark
  },
  modeCardDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 15
  },
  pillToggle: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  pillToggleActive: {
    backgroundColor: COLORS.accentAmber
  },
  pillToggleText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "900"
  },
  infoBox: {
    backgroundColor: COLORS.primaryWash,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary
  },
  infoText: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16
  },
  devFooter: {
    alignItems: "center",
    paddingVertical: 16
  },
  devTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.primary
  },
  devText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2
  },
  devBold: {
    fontWeight: "800",
    color: COLORS.primaryLight
  },
  devSub: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2
  }
});
