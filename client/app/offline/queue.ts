import AsyncStorage from "@react-native-async-storage/async-storage";
const KEY = "offline_pending_txs";

export async function getPendingTxs() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}
