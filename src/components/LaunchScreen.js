import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  TouchableOpacity,
  Platform
} from "react-native";
import { COLORS } from "../theme/colors";

export default function LaunchScreen({ onFinish, isLoading = false }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true
      })
    ]).start();

    // Auto-proceed after 2 seconds if not manually controlled
    const timer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Decorative Natural Green Background Gradients / Circles */}
      <View style={styles.bgGlow} />

      <Animated.View
        style={[
          styles.contentBox,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }]
          }
        ]}
      >
        {/* GaavBilling Circular Pin Emblem */}
        <View style={styles.logoFrame}>
          <Image
            source={require("../../assets/gaavbilling-logo.jpg")}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </View>

        {/* Brand Names */}
        <View style={styles.badgeRow}>
          <Text style={styles.badgeText}>🌱 GAAVCONNECT ECOSYSTEM</Text>
        </View>

        <Text style={styles.brandTitle}>GaavBilling</Text>
        <Text style={styles.brandDevanagari}>गाव बिलिंग</Text>

        <Text style={styles.tagline}>
          सुलभ ग्रामीण व शहरी FMCG वितरण
        </Text>
        <Text style={styles.subTagline}>
          Smart Field Order Booking & Real-Time Sync
        </Text>

        {/* Feature Pills */}
        <View style={styles.featuresRow}>
          <View style={styles.featurePill}>
            <Text style={styles.featureText}>⚡ Instant Desktop Sync</Text>
          </View>
          <View style={styles.featurePill}>
            <Text style={styles.featureText}>📵 100% Offline Ready</Text>
          </View>
        </View>

        {/* Launch / Continue CTA */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={onFinish}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaButtonText}>
            {isLoading ? "लोड होत आहे..." : "सुरू करा • OPEN APP ➔"}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Tasteful, Discreet Attribution Footer */}
      <View style={styles.footerContainer}>
        <Text style={styles.districtText}>
          📍 Nashik District • Ghoti, Igatpuri, Nandgaon & Beyond
        </Text>
        <Text style={styles.attributionText}>
          Developed by <Text style={styles.authorName}>Om Vilas Shinde</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Platform.OS === "ios" ? 48 : 36,
    paddingHorizontal: 24
  },
  bgGlow: {
    position: "absolute",
    top: 60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: COLORS.primaryWash,
    opacity: 0.8
  },
  contentBox: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 420,
    marginTop: "auto",
    marginBottom: "auto"
  },
  logoFrame: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#ffffff",
    padding: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
    borderWidth: 3,
    borderColor: COLORS.primaryLight,
    marginBottom: 20,
    overflow: "hidden"
  },
  logoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 65
  },
  badgeRow: {
    backgroundColor: COLORS.primaryWash,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.primaryLight,
    letterSpacing: 0.8
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.primary,
    letterSpacing: -0.5,
    marginBottom: 2
  },
  brandDevanagari: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.accentGold,
    letterSpacing: 0.5,
    marginBottom: 8
  },
  tagline: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textDark,
    textAlign: "center",
    marginBottom: 4
  },
  subTagline: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 20,
    maxWidth: 280
  },
  featuresRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 28
  },
  featurePill: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  featureText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.primaryLight
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    width: "100%",
    maxWidth: 300,
    alignItems: "center"
  },
  ctaButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  footerContainer: {
    alignItems: "center",
    paddingBottom: 10
  },
  districtText: {
    fontSize: 11,
    color: COLORS.textLight,
    marginBottom: 4,
    fontWeight: "500"
  },
  attributionText: {
    fontSize: 11,
    color: COLORS.textLight
  },
  authorName: {
    fontWeight: "700",
    color: COLORS.primaryLight
  }
});
