import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable, Alert, Share } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { COLORS } from "../theme/colors";
import QRCode from "react-native-qrcode-svg";
import AppButton from "../components/AppButton";

export default function QRDisplay() {
  const router = useRouter();
  const { qr, title, subtitle } = useLocalSearchParams<{
    qr: string;
    title?: string;
    subtitle?: string;
  }>();

  const qrData = useMemo(() => {
    if (!qr) return "";
    try {
      return decodeURIComponent(qr);
    } catch {
      return String(qr);
    }
  }, [qr]);

  const onShare = async () => {
    try {
      await Share.share({ message: qrData });
    } catch {
      Alert.alert("Error", "Could not share QR code");
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: 18, gap: 14 }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: COLORS.border,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "900" }}>
            ←
          </Text>
        </Pressable>

        <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: "900" }}>
          {title || "QR Code"}
        </Text>
      </View>

      {!!subtitle && <Text style={{ color: COLORS.muted }}>{subtitle}</Text>}

      <View style={{ backgroundColor: "#fff", padding: 14, borderRadius: 12 }}>
        {qrData ? (
          <QRCode value={qrData} size={240} />
        ) : (
          <Text style={{ color: COLORS.muted }}>No QR data</Text>
        )}
      </View>

      <AppButton title="Share" onPress={onShare} />
      <AppButton title="Done" onPress={() => router.replace("/(app)/home")} />
    </ScrollView>
  );
}
