import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../theme/colors";

function BigActionCard({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: string;
  onPress: () => void;
}) {
  return (
    <Pressable
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
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text style={{ color: COLORS.text, fontSize: 22, fontWeight: "900" }}>
        {title}
      </Text>

      {/* simple icon placeholder */}
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

  // demo data (replace from storage later)
  const userName = "Nischal";
  const balance = 12345.5;
  const points = 820;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: 22, gap: 14 }}
    >
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
          onPress={() => router.replace("/(auth)/login")}
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

      {/* Balance + Points bar (like your sketch) */}
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
            NPR {balance.toLocaleString()}
          </Text>
        </View>

        <View
          style={{
            width: 1,
            backgroundColor: "rgba(148,180,193,0.25)",
          }}
        />

        <View style={{ flex: 1, padding: 16 }}>
          <Text style={{ color: COLORS.muted, fontSize: 12 }}>ChitoPoints</Text>
          <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: "900" }}>
            {points.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <BigActionCard
        title="Send"
        icon="📤"
        onPress={() => {
          // later route: /(app)/send
          // for now: just show placeholder
          router.push("/(app)/home"); // replace later
        }}
      />

      <BigActionCard
        title="Receive"
        icon="📥"
        onPress={() => {
          // later route: /(app)/receive
          router.push("/(app)/home"); // replace later
        }}
      />

      {/* Load from bank */}
      <Pressable
        onPress={() => {
          // later: /(app)/load-bank
          router.push("/(app)/home"); // replace later
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
          (For demo: adds balance later)
        </Text>
      </Pressable>

      {/* tiny hint */}
      <Text
        style={{
          color: "rgba(234,224,207,0.55)",
          fontSize: 12,
          textAlign: "center",
          marginTop: 8,
        }}
      >
        Offline-first UI • actions will work without internet
      </Text>
    </ScrollView>
  );
}
