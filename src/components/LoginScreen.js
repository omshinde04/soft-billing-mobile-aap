import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { authenticateSalesman } from "../services/catalogService.js";

export default function LoginScreen({ onLoginSuccess, salesmen = [] }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (idToUse, passToUse) => {
    const id = idToUse !== undefined ? idToUse : identifier;
    const pass = passToUse !== undefined ? passToUse : password;

    if (!String(id).trim() || !String(pass).trim()) {
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
        {/* Brand Card */}
        <View style={styles.brandHeader}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>⚡</Text>
          </View>
          <Text style={styles.brandTitle}>Billing-Soft</Text>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>FIELD ORDER BOOKING</Text>
          </View>
          <Text style={styles.brandSubtitle}>
            Distributor Field Sales & Market Beat Management
          </Text>
        </View>

        {/* Login Box */}
        <View style={styles.loginCard}>
          <Text style={styles.cardHeaderTitle}>Salesman Login</Text>
          <Text style={styles.cardHeaderSub}>
            Enter your login credentials assigned by Admin Desktop
          </Text>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>SALESMAN ID OR PHONE</Text>
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
            <Text style={styles.inputLabel}>PASSWORD / PIN</Text>
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
              <Text style={styles.loginButtonText}>LOGIN TO MARKET BEAT ⚡</Text>
            )}
          </TouchableOpacity>

          {/* Quick Demo Logins */}
          {salesmen.length > 0 && (
            <View style={styles.demoSection}>
              <Text style={styles.demoSectionTitle}>1-TAP DEMO LOGINS (CREATED BY ADMIN):</Text>
              <View style={styles.demoPillsRow}>
                {salesmen.map((s) => (
                  <TouchableOpacity
                    key={s.id || s.phone}
                    style={styles.demoPill}
                    onPress={() => handleQuickDemoSelect(s)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.demoPillName}>👤 {s.name}</Text>
                    <Text style={styles.demoPillSub}>PIN: {s.password} • {s.assigned_beat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.footerNote}>
            <Text style={styles.footerNoteText}>
              🔒 Offline Ready: Works even in market basements with zero mobile network.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a"
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20
  },
  brandHeader: {
    alignItems: "center",
    marginBottom: 24
  },
  logoBadge: {
    backgroundColor: "#f59e0b",
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#f59e0b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  logoIcon: {
    fontSize: 28,
    fontWeight: "bold"
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -0.5,
    marginBottom: 6
  },
  badgePill: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.4)",
    marginBottom: 8
  },
  badgePillText: {
    color: "#60a5fa",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5
  },
  brandSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center"
  },
  loginCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 2
  },
  cardHeaderSub: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 16
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fecaca",
    marginBottom: 14
  },
  errorText: {
    fontSize: 12,
    color: "#dc2626",
    fontWeight: "600"
  },
  inputGroup: {
    marginBottom: 14
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#475569",
    letterSpacing: 0.5,
    marginBottom: 6
  },
  textInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0f172a"
  },
  loginButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
    shadowColor: "#2563eb",
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
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.5
  },
  demoSection: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9"
  },
  demoSectionTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.5,
    marginBottom: 8
  },
  demoPillsRow: {
    gap: 8
  },
  demoPill: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  demoPillName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2
  },
  demoPillSub: {
    fontSize: 10,
    color: "#2563eb",
    fontWeight: "600"
  },
  footerNote: {
    marginTop: 16,
    alignItems: "center"
  },
  footerNoteText: {
    fontSize: 10,
    color: "#94a3b8",
    textAlign: "center"
  }
});
