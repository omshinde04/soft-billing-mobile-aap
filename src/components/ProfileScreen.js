import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform
} from "react-native";
import {
  User,
  MapPin,
  LogOut,
  Sparkles,
  Check
} from "lucide-react";
import { COLORS } from "../theme/colors";
import SalesAnalyticsView from "./SalesAnalyticsView";

export default function ProfileScreen({
  salesman,
  salesmen = [],
  onSelectSalesman,
  beats = [],
  currentBeat,
  onSelectBeat,
  orders = [],
  onLogout
}) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 1. Profile Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>
            {salesman?.name ? salesman.name.charAt(0).toUpperCase() : "S"}
          </Text>
        </View>

        <View style={styles.profileDetails}>
          <View style={styles.nameRow}>
            <Text style={styles.salesmanName}>{salesman?.name || "Field Salesman"}</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>ACTIVE</Text>
            </View>
          </View>
          <Text style={styles.salesmanRole}>FIELD SALES REPRESENTATIVE</Text>
          <Text style={styles.salesmanPhone}>📞 {salesman?.phone || "No phone provided"}</Text>
          <Text style={styles.salesmanId}>Salesman ID: #{salesman?.login_id || "9"}</Text>
        </View>
      </View>

      {/* 2. Visual Sales Performance & Product Charts */}
      <SalesAnalyticsView orders={orders} />

      {/* 3. Market Route / Beat Selector */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MapPin size={18} color={COLORS.primary} />
          <Text style={styles.sectionTitle}>मार्केट बीट (Active Market Beat)</Text>
        </View>

        <View style={styles.beatsGrid}>
          {beats.map((beat) => {
            const isSelected = currentBeat === beat;
            return (
              <TouchableOpacity
                key={beat}
                style={[
                  styles.beatChip,
                  isSelected && styles.activeBeatChip
                ]}
                onPress={() => onSelectBeat(beat)}
                activeOpacity={0.75}
              >
                {isSelected ? (
                  <Check size={14} color={COLORS.primary} strokeWidth={3} />
                ) : (
                  <View style={styles.beatDot} />
                )}
                <Text
                  style={[
                    styles.beatChipText,
                    isSelected && styles.activeBeatChipText
                  ]}
                >
                  {beat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 4. Developer Branding Card */}
      <View style={styles.brandCard}>
        <View style={styles.brandTop}>
          <View style={styles.brandIcon}>
            <Sparkles size={20} color={COLORS.accentGold} />
          </View>
          <View>
            <Text style={styles.brandTitle}>GaavBilling • गाव बिलिंग</Text>
            <Text style={styles.brandSub}>सुलभ ग्रामीण व शहरी FMCG वितरण प्रणाली</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.authorSection}>
          <Text style={styles.devBy}>Developed by</Text>
          <Text style={styles.authorName}>Om Vilas Shinde</Text>
          <Text style={styles.authorLocation}>Nashik District • Maharashtra</Text>
        </View>
      </View>

      {/* 5. Logout Action Button */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={onLogout}
        activeOpacity={0.85}
      >
        <LogOut size={18} color="#DC2626" />
        <Text style={styles.logoutBtnText}>लॉगआउट करा (Logout Salesman)</Text>
      </TouchableOpacity>
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
  profileCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  avatarBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900"
  },
  profileDetails: {
    flex: 1
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  salesmanName: {
    fontSize: 16,
    fontWeight: "900",
    color: COLORS.textDark
  },
  verifiedBadge: {
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  verifiedText: {
    color: COLORS.primaryLight,
    fontSize: 8,
    fontWeight: "900"
  },
  salesmanRole: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.primaryLight,
    letterSpacing: 0.5,
    marginTop: 2
  },
  salesmanPhone: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2
  },
  salesmanId: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: "600"
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 14
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primary
  },
  beatsGrid: {
    gap: 8
  },
  beatChip: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  activeBeatChip: {
    backgroundColor: COLORS.primaryWash,
    borderColor: COLORS.primaryLight,
    borderWidth: 1.5
  },
  beatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border
  },
  beatChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textDark
  },
  activeBeatChipText: {
    fontWeight: "800",
    color: COLORS.primary
  },
  brandCard: {
    backgroundColor: COLORS.primaryWash,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20
  },
  brandTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  brandTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.primary
  },
  brandSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12
  },
  authorSection: {
    alignItems: "center"
  },
  devBy: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: "600"
  },
  authorName: {
    fontSize: 15,
    fontWeight: "900",
    color: COLORS.primary,
    marginTop: 2
  },
  authorLocation: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2
  },
  logoutBtn: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24
  },
  logoutBtnText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "800"
  }
});
