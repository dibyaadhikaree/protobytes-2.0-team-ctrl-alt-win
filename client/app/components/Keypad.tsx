import React from "react";
import { View, Text, Pressable } from "react-native";
import { COLORS } from "../theme/colors";

export default function Keypad({
  onPressDigit,
  onBackspace,
  onDot,
}: {
  onPressDigit: (d: string) => void;
  onBackspace: () => void;
  onDot: () => void;
}) {
  const keys: Array<Array<{ label: string; type: "digit" | "dot" | "back" }>> = [
    [
      { label: "1", type: "digit" },
      { label: "2", type: "digit" },
      { label: "3", type: "digit" },
    ],
    [
      { label: "4", type: "digit" },
      { label: "5", type: "digit" },
      { label: "6", type: "digit" },
    ],
    [
      { label: "7", type: "digit" },
      { label: "8", type: "digit" },
      { label: "9", type: "digit" },
    ],
    [
      { label: ".", type: "dot" },
      { label: "0", type: "digit" },
      { label: "⌫", type: "back" },
    ],
  ];

  const press = (k: { label: string; type: "digit" | "dot" | "back" }) => {
    if (k.type === "digit") onPressDigit(k.label);
    if (k.type === "dot") onDot();
    if (k.type === "back") onBackspace();
  };

  return (
    <View style={{ gap: 10 }}>
      {keys.map((row, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 10 }}>
          {row.map((k) => (
            <Pressable
              key={k.label}
              onPress={() => press(k)}
              style={({ pressed }) => ({
                flex: 1,
                height: 56,
                borderRadius: 16,
                backgroundColor: "rgba(148, 180, 193, 0.10)",
                borderWidth: 1,
                borderColor: COLORS.border,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: "900" }}>
                {k.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}
