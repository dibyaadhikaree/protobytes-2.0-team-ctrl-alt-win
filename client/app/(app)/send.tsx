import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../theme/colors";
import AppButton from "../components/AppButton";
import Keypad from "../components/Keypad";

type RecentTx = { name: string; amount: number };

function formatMoney(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export default function SendMoney() {
  const router = useRouter();

  // demo data (later load from storage)
  const balance = 12345.5;

  const recent: RecentTx[] = [
    { name: "Suman", amount: 500 },
    { name: "Riya", amount: 1200 },
    { name: "Aayush", amount: 250 },
  ];

  const [hideBalance, setHideBalance] = useState(false);
  const [amountStr, setAmountStr] = useState(""); // store as string to control keypad

  const displayBalance = useMemo(() => {
    if (hideBalance) return "NPR ••••.••";
    return `NPR ${formatMoney(balance)}`;
  }, [hideBalance, balance]);

  const displayAmount = useMemo(() => {
    if (!amountStr) return "0";
    return amountStr;
  }, [amountStr]);

  const onPressDigit = (d: string) => {
    // prevent leading zeros like "000"
    if (amountStr === "0") {
      setAmountStr(d);
      return;
    }

    // limit length
    if (amountStr.length >= 10) return;

    setAmountStr((prev) => prev + d);
  };

  const onDot = () => {
    if (amountStr.includes(".")) return;
    if (!amountStr) {
      setAmountStr("0.");
      return;
    }
    setAmountStr((prev) => prev + ".");
  };

  const onBackspace = () => {
    setAmountStr((prev) => prev.slice(0, -1));
  };

  const amountNum = useMemo(() => {
    const n = Number(amountStr);
    if (!amountStr) return 0;
    if (Number.isNaN(n)) return 0;
    return n;
  }, [amountStr]);

  const onContinue = () => {
    if (amountNum <= 0) {
      Alert.alert("Invalid amount", "Enter amount to send.");
      return;
    }
    if (amountNum > balance) {
      Alert.alert("Insufficient balance", "Your balance is not enough.");
      return;
    }

    // next page later: choose recipient / scan QR / confirm
    Alert.alert("Continue ✅", `Amount: NPR ${formatMoney(amountNum)}`);
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
          Send Money
        </Text>
      </View>

      {/* Balance card */}
      <View
        style={{
          backgroundColor: COLORS.card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: COLORS.border,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.muted, fontSize: 12 }}>Balance</Text>
          <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "900", marginTop: 4 }}>
            {displayBalance}
          </Text>
        </View>

        <Pressable
          onPress={() => setHideBalance((s) => !s)}
          style={({ pressed }) => ({
            paddingVertical: 10,
            paddingHorizontal: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: COLORS.border,
            backgroundColor: "rgba(84, 119, 146, 0.20)",
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: COLORS.text, fontWeight: "800" }}>
            {hideBalance ? "Show" : "Hide"}
          </Text>
        </Pressable>
      </View>

      {/* Recent transfers (view-only, not clickable) */}
      <View
        style={{
          backgroundColor: COLORS.card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: COLORS.border,
          padding: 16,
          gap: 10,
        }}
      >
        <Text style={{ color: COLORS.text, fontWeight: "900", fontSize: 14 }}>
          Recent fund transfers
        </Text>

        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          {recent.map((r) => (
            <View
              key={r.name}
              // IMPORTANT: This is NOT Pressable => cannot click
              style={{
                minWidth: "30%",
                backgroundColor: "rgba(148, 180, 193, 0.10)",
                borderRadius: 14,
                borderWidth: 1,
                borderColor: COLORS.border,
                paddingVertical: 10,
                paddingHorizontal: 12,
              }}
            >
              <Text style={{ color: COLORS.text, fontWeight: "900" }}>{r.name}</Text>
              <Text style={{ color: COLORS.muted, marginTop: 4 }}>
                NPR {formatMoney(r.amount)}
              </Text>
            </View>
          ))}
        </View>

        <Text style={{ color: "rgba(234,224,207,0.55)", fontSize: 12, marginTop: 2 }}>
          
        </Text>
      </View>

      {/* Amount row */}
      <View
        style={{
          backgroundColor: COLORS.card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: COLORS.border,
          padding: 16,
          gap: 8,
        }}
      >
        <Text style={{ color: COLORS.muted, fontSize: 12 }}>Send Amount</Text>

        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10 }}>
          <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: "900" }}>Rs.</Text>
          <Text style={{ color: COLORS.text, fontSize: 28, fontWeight: "900" }}>
            {displayAmount}
          </Text>
        </View>

        
      </View>

      {/* Keypad */}
      <Keypad onPressDigit={onPressDigit} onBackspace={onBackspace} onDot={onDot} />

      {/* Continue button */}
      <AppButton title="Continue" onPress={onContinue} />
    </ScrollView>
  );
}
