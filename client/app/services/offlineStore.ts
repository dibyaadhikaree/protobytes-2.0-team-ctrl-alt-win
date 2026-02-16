import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_KEYS = "offline_wallet_keys"; // secure (on native)
const KEY_LOCAL_BAL = "offline_local_balance"; // async storage
const KEY_PENDING = "offline_pending_txs"; // async storage

export type WalletKeys = { publicKey: string; secretKey: string };

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

export async function getWalletKeys(): Promise<WalletKeys | null> {
  const raw = await secureGet(KEY_KEYS);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setWalletKeys(keys: WalletKeys) {
  await secureSet(KEY_KEYS, JSON.stringify(keys));
}

export async function getLocalBalance(): Promise<number> {
  const raw = await AsyncStorage.getItem(KEY_LOCAL_BAL);
  return raw ? Number(raw) || 0 : 0;
}

export async function setLocalBalance(amount: number) {
  await AsyncStorage.setItem(KEY_LOCAL_BAL, String(amount));
}

export async function getPendingTxs(): Promise<any[]> {
  const raw = await AsyncStorage.getItem(KEY_PENDING);
  return raw ? JSON.parse(raw) : [];
}

export async function setPendingTxs(list: any[]) {
  await AsyncStorage.setItem(KEY_PENDING, JSON.stringify(list));
}
