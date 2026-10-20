import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image
} from "react-native";
import { authenticateSalesman } from "../services/catalogService";
import { COLORS } from "../theme/colors";

export default function LoginScreen({ salesmen = [], onLoginSuccess }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (overrideId, overridePass) => {
    const id = overrideId !== undefined ? overrideId : identifier;
    const pass = overridePass !== undefined ? overridePass : password;

    if (!id || !pass) {
      setErrorMessage("Please enter both Salesman ID/Phone and PIN.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await authenticateSalesman(id, pass);
      if (res.success) {
        onLoginSuccess(res.salesman);
      } else {
        setErrorMessage(res.error || "Authentication failed.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Login error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoSelect = (salesman) => {
    setIdentifier(salesman.login_id || salesman.phone);
    setPassword(salesman.password || "123");
    handleLogin(salesman.login_id || salesman.phone, salesman.password || "123");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={styles.logoFrame}>
            <Image
              source={require("../../assets/gaavbilling-logo.jpg")}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          <View style={styles.ecosystemPill}>
            <Text style={styles.ecosystemPillText}>🌱 GAAVCONNECT ECOSYSTEM</Text>
          </View>
          <Text style={styles.brandTitle}>GaavBilling</Text>
          <Text style={styles.brandDevanagari}>गाव बिलिंग</Text>
          <Text style={styles.brandSubtitle}>
            सुलभ ग्रामीण व शहरी FMCG वितरण • Nashik & Beyond
          </Text>
        </View>

        {/* Login Box */}
        <View style={styles.loginCard}>
          <Text style={styles.cardHeaderTitle}>विक्रेता लॉगिन • Salesman Login</Text>
          <Text style={styles.cardHeaderSub}>
            Enter credentials assigned by Desktop Billing Admin
          </Text>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>SALESMAN ID OR PHONE NUMBER</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. rahul or 9822012345"
              placeholderTextColor="#94a3b8"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>SECRET PIN / PASSWORD</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. 123"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={() => handleLogin()}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>LOGIN TO MARKET BEAT ➔</Text>
            )}
          </TouchableOpacity>

          {/* Quick Demo Logins for Fast Field Testing */}
          {salesmen.length > 0 && (
            <View style={styles.demoSection}>
              <Text style={styles.demoSectionTitle}>1-TAP DEMO ACCOUNTS (CREATED BY ADMIN):</Text>
              <View style={styles.demoPillsRow}>
                {salesmen.map((s) => (
                  <TouchableOpacity
                    key={s.id || s.phone}
                    style={styles.demoPill}
                    onPress={() => handleQuickDemoSelect(s)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.demoPillTop}>
                      <Text style={styles.demoPillName}>👤 {s.name}</Text>
                      <View style={styles.beatTag}>
                        <Text style={styles.beatTagText}>📍 {s.assigned_beat}</Text>
                      </View>
                    </View>
                    <Text style={styles.demoPillSub}>ID: {s.login_id} • PIN: {s.password}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.footerNote}>
            <Text style={styles.footerNoteText}>
              🔒 100% Offline Ready: Orders save automatically even in basement market alleys with zero mobile network.
            </Text>
          </View>
        </View>

        {/* Small, Tasteful Attribution Footer */}
        <View style={styles.attributionRow}>
          <Text style={styles.attributionText}>
            Developed by <Text style={styles.authorBold}>Om Vilas Shinde</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingTop: 36,
    paddingBottom: 24
  },
  brandHeader: {
    alignItems: "center",
    marginBottom: 20
  },
  logoFrame: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#ffffff",
    padding: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    marginBottom: 10,
    overflow: "hidden"
  },
  logoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 40
  },
  ecosystemPill: {
    backgroundColor: COLORS.primaryWash,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 6
  },
  ecosystemPillText: {
    color: COLORS.primaryLight,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.primary,
    letterSpacing: -0.5,
    marginBottom: 1
  },
  brandDevanagari: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.accentGold,
    marginBottom: 4
  },
  brandSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center"
  },
  loginCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 2
  },
  cardHeaderSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 14
  },
  errorBox: {
    backgroundColor: COLORS.dangerBg,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
    marginBottom: 14
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: "600"
  },
  inputGroup: {
    marginBottom: 14
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6
  },
  textInput: {
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textDark
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4
  },
  loginButtonDisabled: {
    backgroundColor: "#94a3b8"
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  demoSection: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight
  },
  demoSectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.primaryLight,
    letterSpacing: 0.5,
    marginBottom: 8
  },
  demoPillsRow: {
    gap: 8
  },
  demoPill: {
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  demoPillTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2
  },
  demoPillName: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textDark
  },
  beatTag: {
    backgroundColor: COLORS.primaryWash,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4
  },
  beatTagText: {
    fontSize: 10,
    color: COLORS.primaryLight,
    fontWeight: "600"
  },
  demoPillSub: {
    fontSize: 10,
    color: COLORS.textMuted
  },
  footerNote: {
    marginTop: 14,
    backgroundColor: COLORS.primaryWash,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  footerNoteText: {
    fontSize: 10,
    color: COLORS.primaryLight,
    lineHeight: 14,
    textAlign: "center"
  },
  attributionRow: {
    alignItems: "center",
    marginTop: 18
  },
  attributionText: {
    fontSize: 10,
    color: COLORS.textLight
  },
  authorBold: {
    fontWeight: "700",
    color: COLORS.primaryLight
  }
});
