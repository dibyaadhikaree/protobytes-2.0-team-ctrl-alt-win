import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import AppButton from "../components/AppButton";
import AppInput from "../components/AppInput";
import { COLORS } from "../theme/colors";
import { getLocalBalance } from "../services/offlineStore";

export default function Send() {
  const router = useRouter();

  const [amount, setAmount] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [loadingBal, setLoadingBal] = useState<boolean>(true);

  const amountNum = useMemo(() => Number(amount), [amount]);

  // ✅ Always refresh balance when screen is focused (important after offline tx)
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const load = async () => {
        try {
          setLoadingBal(true);
          const b = await getLocalBalance();
          // console.log("get local balance on send screen" , );
          if (mounted) setBalance(b);
        } catch (e) {
          // keep silent, but you can Alert if needed
        } finally {
          if (mounted) setLoadingBal(false);
        }
      };

      load();
      return () => {
        mounted = false;
      };
    }, [])
  );

  const onContinue = () => {
    console.log("continue clicked", balance);
    const trimmed = amount.trim();
    const n = Number(trimmed);

    if (!trimmed) {
      Alert.alert("Enter amount", "Please enter an amount to send.");
      return;
    }
    if (!Number.isFinite(n) || n <= 0) {
      Alert.alert(
        "Invalid amount",
        "Please enter a valid amount greater than 0."
      );
      return;
    }
    if (n > balance) {
      Alert.alert(
        "Insufficient balance",
        `Your offline balance is ${balance}.`
      );
      return;
    }

    // ✅ Pass amount as query param so my-qr can generate pledge QR
    router.push(`/(app)/my-qr?amount=${encodeURIComponent(String(n))}`);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ flex: 1, padding: 16, gap: 14, paddingTop: 18 }}>
        <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: "900" }}>
          Send Money (Offline)
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
          <Text style={{ color: COLORS.muted, marginBottom: 6 }}>
            Available Offline Balance
          </Text>
          <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: "900" }}>
            {loadingBal ? "Loading..." : balance.toString()}
          </Text>
        </View>

        <AppInput
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          placeholder="e.g. 250"
          keyboardType="numeric"
        />

        <AppButton
          title="Continue"
          onPress={onContinue}
          disabled={
            !amount.trim() || !Number.isFinite(amountNum) || amountNum <= 0
          }
        />

        <Text style={{ color: COLORS.muted, fontSize: 12 }}>
          Next: You’ll show a PLEDGE QR. The receiver scans it and shows an ACK
          QR. Then you scan the ACK to finalize the payment offline.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
