import React from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";
import { COLORS } from "../theme/colors";

export default function AppInput({
  label,
  ...props
}: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ color: COLORS.muted, fontSize: 13 }}>{label}</Text>
      <TextInput
        placeholderTextColor="rgba(234, 224, 207, 0.55)"
        style={{
          backgroundColor: COLORS.inputBg,
          borderColor: COLORS.border,
          borderWidth: 1,
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 12,
          color: COLORS.text,
          fontSize: 16,
        }}
        {...props}
      />
    </View>
  );
}
