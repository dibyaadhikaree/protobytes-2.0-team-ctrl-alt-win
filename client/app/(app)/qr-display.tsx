import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable, Alert, Share } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { COLORS } from "../theme/colors";
import { generatePaymentQRData } from "../services/qr";
import QRCode from 'react-native-qrcode-svg';
import AppButton from "../components/AppButton";

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export default function QRDisplay() {
  const router = useRouter();
  const { amount } = useLocalSearchParams<{ amount: string }>();

  const amountNum = useMemo(() => {
    return Number(amount) || 0;
  }, [amount]);

  const qrData = useMemo(() => {
    const data = generatePaymentQRData(amountNum, 'NPR');
    return JSON.stringify(data);
  }, [amountNum]);

  const onShare = async () => {
    try {
      await Share.share({
        message: `Send NPR ${formatMoney(amountNum)} - Scan this QR code to complete the payment`,
        url: qrData,
      });
    } catch (error) {
      console.error('Error sharing QR:', error);
      Alert.alert('Error', 'Could not share QR code');
    }
  };

  const onDone = () => {
    router.replace('/(app)/home');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: 18, gap: 14 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header row */}
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
          <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "900" }}>←</Text>
        </Pressable>

        <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: "900" }}>
          Payment QR Code
        </Text>
      </View>

      {/* Amount display */}
      <View
        style={{
          backgroundColor: COLORS.card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: COLORS.border,
          padding: 16,
          alignItems: "center",
          gap: 8,
        }}
      >
        <Text style={{ color: COLORS.muted, fontSize: 12 }}>Amount to Receive</Text>
        <Text style={{ color: COLORS.text, fontSize: 32, fontWeight: "900" }}>
          NPR {formatMoney(amountNum)}
        </Text>
        <Text style={{ color: COLORS.muted, fontSize: 12 }}>
          Ask the sender to scan this QR code
        </Text>
      </View>

      {/* QR Code */}
      <View
        style={{
          backgroundColor: COLORS.card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: COLORS.border,
          padding: 20,
          alignItems: "center",
          gap: 16,
        }}
      >
        <Text style={{ color: COLORS.text, fontSize: 16, fontWeight: "900" }}>
          Scan to Pay
        </Text>
        
        <View
          style={{
            padding: 16,
            backgroundColor: "white",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          <QRCode value={qrData} size={200} color="black" backgroundColor="white" />
        </View>

        <Text style={{ color: COLORS.muted, fontSize: 12, textAlign: "center" }}>
          This QR code contains the payment details. The sender can scan it to send NPR {formatMoney(amountNum)} to you.
        </Text>
      </View>

      {/* Action buttons */}
      <View style={{ gap: 12 }}>
        <AppButton title="Share QR Code" onPress={onShare} />
        <AppButton title="Done" onPress={onDone} />
      </View>

      {/* Instructions */}
      <View
        style={{
          backgroundColor: "rgba(84, 119, 146, 0.10)",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: COLORS.border,
          padding: 16,
          gap: 8,
        }}
      >
        <Text style={{ color: COLORS.text, fontWeight: "900", fontSize: 14 }}>
          How it works:
        </Text>
        <Text style={{ color: COLORS.muted, fontSize: 12, lineHeight: 18 }}>
          1. Show this QR code to the sender{'\n'}
          2. Sender scans it with their camera{'\n'}
          3. They confirm the payment{'\n'}
          4. Money will be transferred to your account
        </Text>
      </View>
    </ScrollView>
  );
}
