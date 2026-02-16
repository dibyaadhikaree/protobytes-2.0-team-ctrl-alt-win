import React, { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { useNetInfo } from "@react-native-community/netinfo";

import { computeAppMode, AppMode } from "./services/appMode";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const netInfo = useNetInfo();

  const [mode, setMode] = useState<AppMode | null>(null);

  const isOnline = !!netInfo.isConnected && !!netInfo.isInternetReachable;

  useEffect(() => {
    let mounted = true;

    const decide = async () => {
      const m = await computeAppMode(isOnline);
      if (!mounted) return;
      setMode(m);

      const inAuth = segments[0] === "(auth)";

      // LOCKED => force login
      if (m === "LOCKED" && !inAuth) {
        router.replace("/(auth)/login");
        return;
      }

      // ONLINE or OFFLINE_READY => force app
      if ((m === "ONLINE" || m === "OFFLINE_READY") && inAuth) {
        router.replace("/(app)/home");
        return;
      }
    };

    decide();
    return () => {
      mounted = false;
    };
  }, [isOnline, router, segments]);

  // Keep routing stable while mode is being computed
  if (!mode) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}
