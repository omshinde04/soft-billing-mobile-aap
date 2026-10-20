import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Platform
} from "react-native";
import { ChevronDown } from "lucide-react";
import { COLORS } from "../theme/colors";

export default function Header({
  currentSalesman,
  beats = [],
  currentBeat,
  onSelectBeat,
  isOfflineMode,
  onToggleOfflineMode,
  offlineQueueCount = 0
}) {
  return (
    <View style={styles.headerContainer}>
      {/* Top Bar: Brand on Left, Network status on Right */}
      <View style={styles.topRow}>
        {/* Brand Left */}
        <View style={styles.titleRow}>
          <View style={styles.logoFrame}>
            <Image
              source={require("../../assets/gaavbilling-logo.jpg")}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          <View>
            <Text style={styles.appTitle}>GaavBilling</Text>
            <Text style={styles.appSubtitle}>गाव बिलिंग</Text>
          </View>
        </View>

        {/* Live Network Status Pill */}
        <TouchableOpacity
          style={[
            styles.statusPill,
            isOfflineMode ? styles.statusOffline : styles.statusOnline
          ]}
          onPress={onToggleOfflineMode}
          activeOpacity={0.75}
        >
          <View
            style={[
              styles.statusDot,
              isOfflineMode ? styles.dotOffline : styles.dotOnline
            ]}
          />
          <Text
            style={[
              styles.statusText,
              isOfflineMode ? styles.statusTextOffline : styles.statusTextOnline
            ]}
          >
            {isOfflineMode ? "Offline" : "Online"}
          </Text>
          {offlineQueueCount > 0 && (
            <View style={styles.queuePill}>
              <Text style={styles.queuePillText}>{offlineQueueCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Slim 1-Line Beat Selector Bar */}
      {beats.length > 0 && (
        <View style={styles.beatBar}>
          <Text style={styles.beatBarLabel}>📍 Beat:</Text>
          <TouchableOpacity
            style={styles.beatBarTouch}
            onPress={() => {
              const idx = beats.indexOf(currentBeat);
              const next = beats[(idx + 1) % beats.length];
              onSelectBeat(next);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.beatBarValue} numberOfLines={1}>
              {currentBeat || "All Market Beats"}
            </Text>
            <ChevronDown size={14} color={COLORS.primarySoft} />
          </TouchableOpacity>

          {currentSalesman && (
            <View style={styles.salesmanMiniChip}>
              <Text style={styles.salesmanMiniText}>
                👤 {currentSalesman.name?.split(" ")[0] || "User"}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === "ios" ? 14 : (Platform.OS === "android" ? 38 : 14),
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primaryDark
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
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
  appTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -0.3
  },
  appSubtitle: {
    fontSize: 11,
    color: COLORS.accentGold,
    marginTop: 1,
    fontWeight: "700"
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6
  },
  statusOnline: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderColor: "rgba(255, 255, 255, 0.25)"
  },
  statusOffline: {
    backgroundColor: "rgba(244, 162, 97, 0.25)",
    borderColor: "rgba(244, 162, 97, 0.6)"
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5
  },
  dotOnline: {
    backgroundColor: "#4ade80"
  },
  dotOffline: {
    backgroundColor: COLORS.accentGold
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800"
  },
  statusTextOnline: {
    color: "#ffffff"
  },
  statusTextOffline: {
    color: COLORS.accentGold
  },
  queuePill: {
    backgroundColor: COLORS.accentAmber,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    marginLeft: 2
  },
  queuePillText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900"
  },
  beatBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(11, 37, 24, 0.5)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)"
  },
  beatBarLabel: {
    fontSize: 11,
    color: COLORS.primarySoft,
    fontWeight: "700",
    marginRight: 6
  },
  beatBarTouch: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  beatBarValue: {
    fontSize: 12,
    fontWeight: "800",
    color: "#ffffff"
  },
  salesmanMiniChip: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4
  },
  salesmanMiniText: {
    fontSize: 10,
    color: COLORS.primarySoft,
    fontWeight: "700"
  }
});
