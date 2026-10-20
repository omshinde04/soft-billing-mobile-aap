import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { ShoppingBag, Store, ClipboardList, RefreshCw, User } from "lucide-react";
import { COLORS } from "../theme/colors";

export default function BottomNavBar({
  activeTab = "catalog",
  onTabChange,
  cartCount = 0,
  pendingSyncCount = 0
}) {
  const tabs = [
    {
      id: "catalog",
      label: "Catalog",
      labelMr: "ऑर्डर बुक",
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : null
    },
    {
      id: "stores",
      label: "Stores",
      labelMr: "किराणा",
      icon: Store,
      badge: null
    },
    {
      id: "orders",
      label: "Orders",
      labelMr: "ऑर्डर्स",
      icon: ClipboardList,
      badge: null
    },
    {
      id: "sync",
      label: "Sync",
      labelMr: "सिंक",
      icon: RefreshCw,
      badge: pendingSyncCount > 0 ? pendingSyncCount : null,
      badgeColor: COLORS.accentAmber
    },
    {
      id: "profile",
      label: "Profile",
      labelMr: "माहिती",
      icon: User,
      badge: null
    }
  ];

  return (
    <View style={styles.navContainer}>
      <View style={styles.navBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const IconComponent = tab.icon;

          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabButton}
              onPress={() => onTabChange(tab.id)}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrapper}>
                <IconComponent
                  size={22}
                  color={isActive ? COLORS.primary : COLORS.textLight}
                  strokeWidth={isActive ? 2.6 : 1.9}
                />
                {tab.badge !== null && (
                  <View
                    style={[
                      styles.badge,
                      tab.badgeColor ? { backgroundColor: tab.badgeColor } : {}
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {tab.badge > 99 ? "99+" : tab.badge}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  isActive && styles.activeTabLabel
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>

              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === "ios" ? 22 : 6,
    paddingTop: 6,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 16,
    zIndex: 99
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 52
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
    position: "relative"
  },
  iconWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    height: 26,
    width: 32
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.textLight,
    marginTop: 2
  },
  activeTabLabel: {
    color: COLORS.primary,
    fontWeight: "800"
  },
  activeIndicator: {
    width: 16,
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginTop: 2
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: COLORS.accentGold,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#ffffff"
  },
  badgeText: {
    color: COLORS.primaryDark,
    fontSize: 9,
    fontWeight: "900"
  }
});
