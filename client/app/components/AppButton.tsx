import React from "react";
import { Pressable, Text, ActivityIndicator } from "react-native";
import { COLORS } from "../theme/colors";

export default function AppButton({
  title,
  onPress,
  loading,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => ({
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
        opacity: pressed || loading ? 0.85 : 1,
      })}
    >
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text style={{ color: COLORS.text, fontWeight: "800", fontSize: 16 }}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
