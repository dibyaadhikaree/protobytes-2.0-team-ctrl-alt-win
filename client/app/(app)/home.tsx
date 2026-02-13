import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../theme/colors";
import { logoutUser } from "../services/auth";
import { isOnline } from "../services/network";
import { getCachedWallet } from "../services/walletCache";
import { getPendingTxs } from "../offline/queue";

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

  const [online, setOnline] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [points, setPoints] = useState(0);
  const [loadingLocal, setLoadingLocal] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("User");

  console.log("HomePage component rendered");

  const loadLocalState = async () => {
    try {
      const isOnlineStatus = await isOnline();
      setOnline(isOnlineStatus);
      console.log("Network status:", isOnlineStatus);

      const cached = await getCachedWallet();
      setWallet(cached);
      if (cached?.balance) {
        setPoints(cached.balance);
      }
      if (cached?.name) {
        setUserName(cached.name);
      }
      setLastSyncAt(new Date().toLocaleTimeString());
      console.log("Wallet loaded:", cached);

      // pending queue count
      const pending = await getPendingTxs();
      setPendingCount(Array.isArray(pending) ? pending.length : 0);
    } catch (error) {
      console.error("Home init error:", error);
      setPoints(0);
    } finally {
      setLoadingLocal(false);
    }
  };

  useEffect(() => {
    loadLocalState();
  }, []);

  const onLogout = async () => {
    // Alert.alert("Logout", "Are you sure you want to logout?", [
    //   { text: "Cancel", style: "cancel" },
    //   {
    //     text: "Logout",
    //     style: "destructive",
    //     onPress: async () => {},
    //   },
    // ]);
    await logoutUser();
    router.replace("/(auth)/login");
  };

  const balanceText =
    points === null ? "—" : `NPR ${points.toLocaleString()}`;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: 22, gap: 14 }}
    >
      {/* Status banner */}
      <Pressable
        onPress={loadLocalState}
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
          {online ? "ONLINE" : "OFFLINE"}{" "}
          <Text style={{ color: COLORS.muted, fontWeight: "700" }}>
            • Tap to refresh
          </Text>
        </Text>

        <Text style={{ color: COLORS.muted, marginTop: 4, fontSize: 12 }}>
          Pending transfers: {pendingCount}
          {lastSyncAt ? ` • Last sync: ${lastSyncAt}` : ""}
        </Text>
      </Pressable>

      {/* Top header */}
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

      {/* Balance + Points */}
      <View
        style={{
          backgroundColor: COLORS.card,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: COLORS.border,
          overflow: "hidden",
          flexDirection: "row",
        }}
      >
        <View style={{ flex: 1, padding: 16 }}>
          <Text style={{ color: COLORS.muted, fontSize: 12 }}>Balance</Text>
          <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "900" }}>
            {balanceText}
          </Text>

          {points === null && (
            <Text style={{ color: COLORS.muted, marginTop: 6, fontSize: 12 }}>
              Go online once to sync your wallet.
            </Text>
          )}
        </View>

        <View style={{ width: 1, backgroundColor: "rgba(148,180,193,0.25)" }} />

        <View style={{ flex: 1, padding: 16 }}>
          <Text style={{ color: COLORS.muted, fontSize: 12 }}>ChitoPoints</Text>
          <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "900" }}>
            {points.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Actions (offline allowed) */}
      <BigActionCard
        title="Send"
        icon="📤"
        subtitle="Works offline • creates a pending transfer"
        onPress={() => {
          console.log("=== SEND BUTTON CLICKED ===");
          console.log("Current URL:", window.location.href);
          console.log("Attempting navigation to /send");
          router.replace("/(app)/send");
          console.log("Navigation command sent");
        }}
      />

      <BigActionCard
        title="Receive"
        icon="📥"
        subtitle="Works offline • shows My QR"
        onPress={() => {
          console.log('Receive button pressed - testing navigation');
          try {
            // Try different navigation approaches
            console.log('Trying router.push with scan-qr...');
            router.push("/(app)/scan-qr");
            console.log('Navigation command sent');
          } catch (error) {
            console.log('Navigation error:', error);
            Alert.alert("Error", "Could not open QR scanner");
          }
        }}
      />

      {/* Online-only action */}
      <Pressable
        onPress={() => {
          if (!online) {
            Alert.alert("Offline", "Internet required to load from bank.");
            return;
          }
          Alert.alert("Load from Bank", "Next: implement bank top-up flow");
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
        Offline-first UI • balance from cache • transfers queued when offline
      </Text>
    </ScrollView>
  );
}
