import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { fetchMe, getToken, clearToken } from "./services/session";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [checking, setChecking] = useState(true);
  const hasRedirectedRef = useRef(false); // prevents redirect loops

  useEffect(() => {
    let isMounted = true;

    const guard = async () => {
      try {
        setChecking(true);

        // segments can be empty initially
        const group = segments?.[0]; // "(auth)" or "(app)" or undefined
        if (!group) return;

        const token = await getToken();

        const inAuthGroup = group === "(auth)";
        const inAppGroup = group === "(app)";

        // ✅ If no token: allow auth screens, block app screens
        if (!token) {
          if (inAppGroup && !hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            router.replace("/(auth)/login");
          }
          return;
        }

        // ✅ Token exists: verify once
        try {
          await fetchMe();

          // If on auth screens while logged in -> go home
          if (inAuthGroup && !hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            router.replace("/(app)/home");
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          // token invalid -> clear
          await clearToken();

          if (inAppGroup && !hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            router.replace("/(auth)/login");
          }
        }
      } finally {
        if (isMounted) setChecking(false);

        // Reset redirect lock after a short moment so future navigation works
        setTimeout(() => {
          hasRedirectedRef.current = false;
        }, 300);
      }
    };

    guard();

    return () => {
      isMounted = false;
    };
  }, [router, segments]);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
