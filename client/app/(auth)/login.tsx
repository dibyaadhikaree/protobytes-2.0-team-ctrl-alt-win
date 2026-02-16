import React, { useState } from "react";
import { View, Text, Pressable, Alert, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { COLORS } from "../theme/colors";
import AppInput from "../components/AppInput";
import AppButton from "../components/AppButton";

import { loginUser } from "../services/auth";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    try {
      if (!email.trim() || password.length < 4) {
        Alert.alert("Invalid", "Enter email and password (min 4 chars).");
        return;
      }

      setLoading(true);
      await loginUser({ email: email.trim(), password });
      Alert.alert("Logged in ✅", "Wallet cached for offline payments.");
      router.replace("/(app)/home");
    } catch (e: any) {
      Alert.alert("Login failed", e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: 28 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={{ color: COLORS.muted, fontSize: 14, marginBottom: 8 }}>
        Welcome
      </Text>

      <Text style={{ color: COLORS.text, fontSize: 26, fontWeight: "900" }}>
        Welcome to{" "}
        <Text style={{ color: COLORS.primary, fontWeight: "900" }}>
          ChitoPay
        </Text>
      </Text>

      <Text style={{ color: COLORS.muted, marginTop: 8, lineHeight: 20 }}>
        Nepal&apos;s first offline payment method . Login to continue.
      </Text>

      {/* Card */}
      <View
        style={{
          marginTop: 18,
          backgroundColor: COLORS.card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: COLORS.border,
          padding: 16,
          gap: 14,
        }}
      >
        <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "800" }}>
          Login
        </Text>

        <AppInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          // keyboardType="phone-pad"
          placeholder="email"
        />

        <AppInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />

        <AppButton title="Login" onPress={onLogin} loading={loading} />

        <Pressable
          onPress={() =>
            Alert.alert("Forgot Password", "We’ll add this later.")
          }
          style={{ alignSelf: "center", paddingVertical: 6 }}
        >
          <Text
            style={{ color: COLORS.muted, textDecorationLine: "underline" }}
          >
            Forgot password?
          </Text>
        </Pressable>

        <View
          style={{
            height: 1,
            backgroundColor: "rgba(148,180,193,0.25)",
            marginVertical: 4,
          }}
        />

        <Text style={{ color: COLORS.muted, textAlign: "center" }}>
          Not a user?{" "}
          <Link
            href="/(auth)/register"
            style={{ color: COLORS.text, fontWeight: "800" }}
          >
            Register
          </Link>
        </Text>
      </View>

      {/* Footer hint */}
      <Text
        style={{
          color: "rgba(234,224,207,0.55)",
          marginTop: 16,
          fontSize: 12,
          textAlign: "center",
          lineHeight: 18,
        }}
      ></Text>
    </ScrollView>
  );
}
