import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_USER = "cached_user";
const KEY_TOKEN = "auth_token";

async function secureGet(key: string) {
  if (Platform.OS === "web") {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  const SecureStore = await import("expo-secure-store");
  return SecureStore.getItemAsync(key);
}

async function secureSet(key: string, val: string) {
  if (Platform.OS === "web") {
    try {
      localStorage.setItem(key, val);
    } catch {}
    return;
  }
  const SecureStore = await import("expo-secure-store");
  await SecureStore.setItemAsync(key, val);
}

async function secureDel(key: string) {
  if (Platform.OS === "web") {
    try {
      localStorage.removeItem(key);
    } catch {}
    return;
  }
  const SecureStore = await import("expo-secure-store");
  await SecureStore.deleteItemAsync(key);
}

export async function getToken() {
  return secureGet(KEY_TOKEN);
}
export async function setToken(token: string) {
  await secureSet(KEY_TOKEN, token);
}
export async function clearToken() {
  await secureDel(KEY_TOKEN);
}

export type CachedUser = { id: string; name?: string; email?: string };

export async function getCachedUser(): Promise<CachedUser | null> {
  const raw = await AsyncStorage.getItem(KEY_USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
export async function setCachedUser(user: CachedUser) {
  await AsyncStorage.setItem(KEY_USER, JSON.stringify(user));
}
export async function clearCachedUser() {
  await AsyncStorage.removeItem(KEY_USER);
}

export async function clearSession() {
  await Promise.all([clearToken(), clearCachedUser()]);
}
