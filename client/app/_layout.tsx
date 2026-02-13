import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View, Alert } from "react-native";
import { fetchMe, getToken, clearToken } from "./services/session";
import { isOnline } from "./services/network";
import { getCachedWallet, saveCachedWallet } from "./services/walletCache";
// import { fetchWalletMe } from "./services/wallet"; // enable when backend ready

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [checking, setChecking] = useState(true);
  const lock = useRef(false);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setChecking(true);

        const group = segments?.[0];
        if (!group) return;

        const token = await getToken();
        const inAuth = group === "(auth)";
        const inApp = group === "(app)";

        // 1) Not logged in -> must go auth
        if (!token) {
          if (inApp && !lock.current) {
            lock.current = true;
            router.replace("/(auth)/login");
          }
          return;
        }

        // 2) Logged in -> decide online/offline behavior
        const online = await isOnline();

        if (!online) {
          // OFFLINE MODE
          // allow app screens even without server calls
          // but we need cached wallet for balance UI
          const cached = await getCachedWallet();

          if (!cached) {
            // user logged in previously but no cached wallet yet
            // show a friendly message and still allow app
            // you can also redirect to a "limited mode" screen
            Alert.alert(
              "Offline mode",
              "You are offline. Balance cache not found yet. Connect once to sync your wallet."
            );
          }

          if (inAuth && !lock.current) {
            lock.current = true;
            router.replace("/(app)/home");
          }
          return;
        }

        // ONLINE MODE -> verify token
        try {
          await fetchMe();

          // If you have wallet/me endpoint, fetch + cache it:
          // const walletRes = await fetchWalletMe();
          // const wallet = walletRes.data || walletRes.wallet || walletRes;
          // await saveCachedWallet(wallet);

          if (inAuth && !lock.current) {
            lock.current = true;
            router.replace("/(app)/home");
          }
        } catch (e) {
          await clearToken();
          if (inApp && !lock.current) {
            lock.current = true;
            router.replace("/(auth)/login");
          }
        }
      } finally {
        if (mounted) setChecking(false);
        setTimeout(() => (lock.current = false), 300);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [segments]);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
