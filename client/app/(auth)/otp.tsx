import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { COLORS } from "../theme/colors";
import AppInput from "../components/AppInput";
import AppButton from "../components/AppButton";

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

export default function OtpVerification() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string; id?: string }>();

  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(200); // 200 sec like your sketch
  const [loading, setLoading] = useState(false);

  const displayId = useMemo(() => {
    // show something user-friendly
    if (params?.phone) return params.phone;
    if (params?.id) return params.id;
    return "your ChitoPay ID";
  }, [params?.phone, params?.id]);

  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const onConfirm = async () => {
    if (otp.trim().length < 4) {
      Alert.alert("Invalid OTP", "Enter the OTP code.");
      return;
    }

    setLoading(true);

    // Hackathon UI: fake verify
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Verified ✅", "OTP confirmed.");
      // later: router.replace("/(tabs)/home") or wherever you go after auth
      router.replace("/(auth)/login");
    }, 700);
  };

  const onResend = async () => {
    if (secondsLeft > 0) return;
    Alert.alert("OTP resent ✅", "A new OTP has been generated (demo).");
    setOtp("");
    setSecondsLeft(200);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: 28 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={{ color: COLORS.muted, fontSize: 14, marginBottom: 8 }}>
        OTP Page
      </Text>

      <Text style={{ color: COLORS.text, fontSize: 26, fontWeight: "900" }}>
        OTP{" "}
        <Text style={{ color: COLORS.primary, fontWeight: "900" }}>
          Verification
        </Text>
      </Text>

      <Text style={{ color: COLORS.muted, marginTop: 8, lineHeight: 20 }}>
        OTP has been sent to{" "}
        <Text style={{ color: COLORS.text, fontWeight: "800" }}>
          {displayId}
        </Text>
        .
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
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: COLORS.muted }}>Enter OTP</Text>
          <Text style={{ color: COLORS.muted }}>
            OTP expires in:{" "}
            <Text style={{ color: secondsLeft > 0 ? COLORS.text : "#ffb4b4" }}>
              {pad2(mm)}:{pad2(ss)}
            </Text>
          </Text>
        </View>

        <AppInput
          label="OTP Code"
          value={otp}
          onChangeText={(t) => setOtp(t.replace(/\D/g, "").slice(0, 6))}
          keyboardType="number-pad"
          placeholder="123456"
        />

        <AppButton title="Confirm Code" onPress={onConfirm} loading={loading} />

        <Pressable
          onPress={onResend}
          style={{ alignSelf: "center", paddingVertical: 6, opacity: secondsLeft > 0 ? 0.5 : 1 }}
          disabled={secondsLeft > 0}
        >
          <Text style={{ color: COLORS.muted, textDecorationLine: "underline" }}>
            Resend OTP
          </Text>
        </Pressable>

         <Text style={{ color: COLORS.muted, textAlign: "center" }}> 
          {" "}
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: COLORS.text, fontWeight: "800" }}>
              Go back
            </Text>
          </Pressable>
        </Text>
      </View>
    </ScrollView>
  );
}
