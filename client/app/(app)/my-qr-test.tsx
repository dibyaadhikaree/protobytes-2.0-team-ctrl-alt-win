import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { COLORS } from "../theme/colors";

export default function MyQRTest() {
  const router = useRouter();
  const { amount } = useLocalSearchParams<{ amount: string }>();

  console.log("MyQRTest page loaded with amount:", amount);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: 18, gap: 14 }}
    >
      <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: "900" }}>
        My QR Test Page
      </Text>
      
      <Text style={{ color: COLORS.text, fontSize: 16 }}>
        Amount: {amount || "No amount"}
      </Text>
      
      <Text style={{ color: COLORS.muted, fontSize: 14 }}>
        If you can see this page, the navigation works!
      </Text>
      
      <View style={{ 
        width: 200, 
        height: 200, 
        backgroundColor: "white", 
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Text style={{ color: COLORS.text, fontSize: 12 }}>
          QR Code Placeholder
        </Text>
        <Text style={{ color: COLORS.muted, fontSize: 10 }}>
          Amount: {amount}
        </Text>
      </View>
    </ScrollView>
  );
}
