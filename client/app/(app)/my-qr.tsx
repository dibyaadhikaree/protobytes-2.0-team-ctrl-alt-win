import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import QRCode from "react-native-qrcode-svg";

import { COLORS } from "../theme/colors";
import AppButton from "../components/AppButton";
import { generatePledgeQR } from "../services/offlinePayment";
import { getLocalBalance, setLocalBalance } from "../services/offlineStore";

export default function MyQR() {
  const router = useRouter();
  const { amount } = useLocalSearchParams<{ amount?: string }>();

  const amountNum = useMemo(() => Number(amount), [amount]);

  const [qrData, setQrData] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = async () => {
    setLoading(true);
    setQrData("");

    try {
      const b = await getLocalBalance();
      setBalance(b);

      if (!Number.isFinite(amountNum) || amountNum <= 0) {
        throw new Error("Invalid amount received. Go back and try again.");
      }

      // Important: If offline balance isn't set, pledge generation will fail.
      const pledge = await generatePledgeQR(amountNum);
      setQrData(pledge);
    } catch (e: any) {
      Alert.alert("QR Error", e?.message || "Failed to generate PLEDGE QR");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountNum]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: 18, gap: 14 }}
    >
      <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: "900" }}>
        My QR (PLEDGE)
      </Text>

      <View
        style={{
          backgroundColor: COLORS.card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: COLORS.border,
          padding: 14,
        }}
      >
        <Text style={{ color: COLORS.muted }}>Amount</Text>
        <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "900" }}>
          {String(amountNum)}
        </Text>

        <Text style={{ color: COLORS.muted, marginTop: 10 }}>
          Offline Balance
        </Text>
        <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "900" }}>
          {balance}
        </Text>
      </View>

      <View style={{ backgroundColor: "#fff", padding: 14, borderRadius: 12 }}>
        {loading ? (
          <Text style={{ color: COLORS.muted }}>Generating QR...</Text>
        ) : qrData ? (
          <QRCode value={qrData} size={240} />
        ) : (
          <Text style={{ color: COLORS.muted }}>
            QR not generated (check balance / errors).
          </Text>
        )}
      </View>

      <AppButton
        title="Scan Receiver ACK"
        onPress={() =>
          router.push({
            pathname: "/(app)/scan-qr",
            params: { mode: "sender" },
          })
        }
      />

      {/* TEMP DEV BUTTON — remove later */}

      <AppButton title="Back" onPress={() => router.back()} />
    </ScrollView>
  );
}
