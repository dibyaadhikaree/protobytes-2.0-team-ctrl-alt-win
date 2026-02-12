import React, { useState } from "react";
import { View, Text, Alert, ScrollView } from "react-native";
import { Link, useRouter } from "expo-router";
import { COLORS } from '../theme/colors';
import AppInput from "../components/AppInput";
import AppButton from "../components/AppButton";

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const onRegister = async () => {
    if (!name.trim() || !phone.trim() || password.length < 4) {
      Alert.alert("Invalid", "Fill all fields (password min 4 chars).");
      return;
    }

    Alert.alert("Registered ✅", "Now login with your credentials.");
    router.replace("/(auth)/login");
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: 28 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={{ color: COLORS.muted, fontSize: 14, marginBottom: 8 }}>
        Create account
      </Text>

      <Text style={{ color: COLORS.text, fontSize: 26, fontWeight: "900" }}>
        Join{" "}
        <Text style={{ color: COLORS.primary, fontWeight: "900" }}>
          ChitoPay
        </Text>
      </Text>

      <Text style={{ color: COLORS.muted, marginTop: 8, lineHeight: 20 }}>
        Register once. Later we’ll sync securely when online.
      </Text>

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
          Register
        </Text>

        <AppInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Your name"
        />

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
          placeholder="Create password"
        />

        <AppButton title="Create Account" onPress={onRegister} />

        <Text style={{ color: COLORS.muted, textAlign: "center" }}>
          Already have an account?{" "}
          <Link href="/(auth)/login" style={{ color: COLORS.text, fontWeight: "800" }}>
            Login
          </Link>
        </Text>
      </View>
    </ScrollView>
  );
}
