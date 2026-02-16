import React from "react";
import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="wallet" />
      <Stack.Screen name="send" />
      <Stack.Screen name="my-qr" />
      <Stack.Screen name="scan-qr" />
      <Stack.Screen name="qr-display" />
      <Stack.Screen name="history" />
    </Stack>
  );
}
