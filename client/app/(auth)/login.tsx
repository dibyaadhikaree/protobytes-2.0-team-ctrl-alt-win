import React, { useState } from "react";
import { View, Text, Pressable, Alert, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { COLORS } from "../theme/colors";
import AppInput from "../components/AppInput";
import AppButton from "../components/AppButton";

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const onLogin = async () => {
    // hackathon MVP: just validate UI
    if (!phone.trim() || password.length < 4) {
      Alert.alert("Invalid", "Enter phone and password (min 4 chars).");
      return;
    }

    Alert.alert("Logged in ✅", "Next step: connect backend auth.");
    // later: router.replace("/(tabs)/home") or your home route
    router.replace("/(app)/home");

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
        Nepal's first offline payment method . Login to continue.
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
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="98XXXXXXXX"
        />

        <AppInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />

        <AppButton title="Login" onPress={onLogin} />

        <Pressable
          onPress={() => Alert.alert("Forgot Password", "We’ll add this later.")}
          style={{ alignSelf: "center", paddingVertical: 6 }}
        >
          <Text style={{ color: COLORS.muted, textDecorationLine: "underline" }}>
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
          <Link href="/(auth)/register" style={{ color: COLORS.text, fontWeight: "800" }}>
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
      >
       
      </Text>
    </ScrollView>
  );
}
