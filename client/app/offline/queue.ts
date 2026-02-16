import {
  getPendingTxs as _get,
  setPendingTxs as _set,
} from "../services/offlineStore";

export async function getPendingTxs() {
  return _get();
}

export async function addPendingTx(tx: any) {
  const list = await _get();
  list.unshift(tx);
  await _set(list);
  return tx;
}

export async function markTxStatus(
  tx_id: string,
  status: "PENDING_SYNC" | "CONFIRMED" | "FAILED",
  reason?: string
) {
  const list = await _get();
  const updated = list.map((t) => {
    if (t.tx_id !== tx_id) return t;
    return { ...t, status, reason: reason ?? t.reason };
  });
  await _set(updated);
  return updated;
}
