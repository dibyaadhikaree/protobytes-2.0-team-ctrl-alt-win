import { Platform } from "react-native";

const TOKEN_KEY = "token";

export async function getToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  // ✅ Only import SecureStore on native
  const SecureStore = await import("expo-secure-store");
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  if (Platform.OS === "web") {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {}
    return;
  }

  const SecureStore = await import("expo-secure-store");
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  if (Platform.OS === "web") {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
    return;
  }

  const SecureStore = await import("expo-secure-store");
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
