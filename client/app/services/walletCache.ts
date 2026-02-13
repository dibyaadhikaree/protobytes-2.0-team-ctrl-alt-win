import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "cached_wallet";

export async function saveCachedWallet(wallet: any) {
  await AsyncStorage.setItem(KEY, JSON.stringify(wallet));
}

export async function getCachedWallet() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearCachedWallet() {
  await AsyncStorage.removeItem(KEY);
}
