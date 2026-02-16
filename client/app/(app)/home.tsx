import React, { useCallback, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useNetInfo } from "@react-native-community/netinfo";

import { COLORS } from "../theme/colors";
import { logoutUser } from "../services/auth";
import { getPendingTxs } from "../offline/queue";
import { getLocalBalance } from "../services/offlineStore";
import { getCachedUser } from "../services/sessionStore";
import { bootstrapOnline } from "../services/onlineBootstrap";

function BigActionCard({
  title,
  icon,
  onPress,
  disabled,
  subtitle,
}: {
  title: string;
  icon: string;
  onPress: () => void;
  disabled?: boolean;
  subtitle?: string;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: COLORS.card,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: COLORS.border,
        padding: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
      })}
    >
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: "900" }}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={{ color: COLORS.muted, marginTop: 6, fontSize: 12 }}>
            {subtitle}
          </Text>
        )}
      </View>

      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: "rgba(84, 119, 146, 0.35)",
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "rgba(148, 180, 193, 0.25)",
        }}
      >
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
    </Pressable>
  );
}

export default function Home() {
  const router = useRouter();
  const netInfo = useNetInfo();
  const online = !!netInfo.isConnected && !!netInfo.isInternetReachable;

  const [userName, setUserName] = useState("User");
  const [balance, setBalance] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const balanceText = useMemo(
    () => `NPR ${Number(balance || 0).toLocaleString()}`,
    [balance]
  );

  const loadLocalState = async () => {
    const user = await getCachedUser();

    console.log("LOCAL STATE ", user);
    if (user?.name) setUserName(user.name);

    const b = await getLocalBalance();
    setBalance(b);

    const pending = await getPendingTxs();
    const pendingOnly = Array.isArray(pending)
      ? pending.filter((t: any) => t.status === "PENDING_SYNC")
      : [];
    setPendingCount(pendingOnly.length);
  };

  const syncNow = async () => {
    if (!online) {
      Alert.alert("Offline", "Internet required to sync.");
      return;
    }
    try {
      setSyncing(true);
      const res = await bootstrapOnline(); // refresh user + wallet + sync
      await loadLocalState();
      setLastSyncAt(new Date().toLocaleTimeString());
      Alert.alert(
        "Synced ✅",
        `New balance: NPR ${Number(res.balance).toLocaleString()}`
      );
    } catch (e: any) {
      Alert.alert("Sync failed", e?.message || "Could not sync");
    } finally {
      setSyncing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadLocalState();
      if (online) syncNow(); // auto-refresh when online
    }, [online])
  );

  const onLogout = async () => {
    await logoutUser();
    router.replace("/(auth)/login");
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: 22, gap: 14 }}
    >
      {/* Status banner */}
      <Pressable
        onPress={async () => {
          await loadLocalState();
          if (online) await syncNow();
        }}
        style={{
          backgroundColor: online
            ? "rgba(59, 130, 246, 0.12)"
            : "rgba(245, 158, 11, 0.12)",
          borderRadius: 14,
          borderWidth: 1,
          borderColor: online
            ? "rgba(59, 130, 246, 0.25)"
            : "rgba(245, 158, 11, 0.25)",
          paddingVertical: 10,
          paddingHorizontal: 12,
        }}
      >
        <Text style={{ color: COLORS.text, fontWeight: "900" }}>
          {online ? "🟢 ONLINE" : "🔴 OFFLINE MODE"}{" "}
          <Text style={{ color: COLORS.muted, fontWeight: "700" }}>
            • Tap to refresh
          </Text>
        </Text>

        <Text style={{ color: COLORS.muted, marginTop: 4, fontSize: 12 }}>
          Pending transfers: {pendingCount}
          {lastSyncAt ? ` • Last sync: ${lastSyncAt}` : ""}
        </Text>
      </Pressable>

      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            backgroundColor: "rgba(84, 119, 146, 0.35)",
            borderWidth: 1,
            borderColor: COLORS.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: COLORS.text, fontWeight: "900" }}>
            {userName.slice(0, 1).toUpperCase()}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.muted, fontSize: 12 }}>
            Welcome back
          </Text>
          <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: "900" }}>
            Hi, {userName}
          </Text>
        </View>

        <Pressable
          onPress={onLogout}
          style={({ pressed }) => ({
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: COLORS.border,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: COLORS.muted, fontWeight: "700" }}>Logout</Text>
        </Pressable>
      </View>

      {/* Balance card */}
      <View
        style={{
          backgroundColor: COLORS.card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: COLORS.border,
          overflow: "hidden",
        }}
      >
        <View style={{ padding: 16 }}>
          <Text style={{ color: COLORS.muted, fontSize: 12 }}>
            Offline Balance (usable without internet)
          </Text>
          <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "900" }}>
            {balanceText}
          </Text>

          <Text style={{ color: COLORS.muted, marginTop: 6, fontSize: 12 }}>
            {online
              ? "Online: server will verify and refresh balance."
              : "Offline: payments are stored as pending transfers."}
          </Text>
        </View>

        {online && (
          <Pressable
            onPress={syncNow}
            disabled={syncing}
            style={({ pressed }) => ({
              borderTopWidth: 1,
              borderTopColor: "rgba(148,180,193,0.25)",
              paddingVertical: 14,
              alignItems: "center",
              opacity: syncing ? 0.5 : pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ color: COLORS.text, fontWeight: "900" }}>
              {syncing ? "Syncing..." : "Sync Now"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* Actions */}
      <BigActionCard
        title="Send"
        icon="📤"
        subtitle="Works offline • creates PLEDGE QR • waits for ACK"
        onPress={() => router.push("/(app)/send")}
      />

      <BigActionCard
        title="Receive"
        icon="📥"
        subtitle="Works offline • scan PLEDGE • show ACK QR"
        onPress={() =>
          router.push({
            pathname: "/(app)/scan-qr",
            params: { mode: "receiver" },
          })
        }
      />

      <BigActionCard
        title="History"
        icon="🧾"
        subtitle="Pending + confirmed transfers"
        onPress={() => router.push("/(app)/history")}
      />

      {/* Online-only */}
      <Pressable
        onPress={() => {
          if (!online) {
            Alert.alert("Offline", "Internet required to load from bank.");
            return;
          }
          router.push("/(app)/wallet");
        }}
        style={({ pressed }) => ({
          marginTop: 6,
          backgroundColor: "rgba(84, 119, 146, 0.25)",
          borderRadius: 18,
          borderWidth: 1,
          borderColor: COLORS.border,
          paddingVertical: 16,
          alignItems: "center",
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text style={{ color: COLORS.text, fontWeight: "900", fontSize: 16 }}>
          Load from Bank
        </Text>
        <Text style={{ color: COLORS.muted, marginTop: 6, fontSize: 12 }}>
          {online ? "(Online only)" : "(Offline — disabled)"}
        </Text>
      </Pressable>

      <Text
        style={{
          color: "rgba(234,224,207,0.55)",
          fontSize: 12,
          textAlign: "center",
          marginTop: 8,
        }}
      >
        Offline-first: cached name + local balance • pending queue • server sync
      </Text>
    </ScrollView>
  );
}
