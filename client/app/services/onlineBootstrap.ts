import { apiGet, apiPost } from "./api";
import { setCachedUser } from "./sessionStore";
import { getPendingTxs, markTxStatus } from "../offline/queue";
import { setLocalBalance } from "./offlineStore";

export async function bootstrapOnline() {
  // 1) Fetch real user
  const { user: me } = await apiGet("/auth/me"); // should return user object (unwrapped "data" if your API uses {status,data})
  // adjust keys if your backend uses different names:
  const userId = String(
    me?._id || me?.id || me?.data?._id || me?.data?.id || ""
  );
  const name = me?.name || me?.fullName || me?.username || "User";
  const email = me?.email;

  if (userId) {
    await setCachedUser({ id: userId, name, email });
  } else {
    // still store name if id missing (better than nothing)
    await setCachedUser({ id: "unknown", name, email });
  }

  // 2) Fetch wallet balance
  const wallet = await apiGet("/wallet/me"); // -> { userId, balance, maxBalance }
  if (typeof wallet?.balance !== "number") {
    throw new Error("Wallet API returned invalid balance");
  }

  // overwrite local offline balance (source of truth)
  await setLocalBalance(wallet.balance);

  // 3) Sync pending txs (if endpoint not ready yet, you can comment this block)
  const pending = await getPendingTxs();
  const toSync = Array.isArray(pending)
    ? pending.filter((t: any) => t.status === "PENDING_SYNC")
    : [];

  if (toSync.length === 0) {
    return { balance: wallet.balance, synced: 0 };
  }
  console.log("SENDING TO SYNC:", toSync[0]);

  const txs = toSync
    .filter((t: any) => t.status === "PENDING_SYNC")
    .map((t: any) => ({
      tx_id: t.tx_id,
      from: t.from,
      to: t.to,
      amount: t.amount,
      senderPublicKey: t.senderPublicKey,
      senderSignature: t.senderSignature,
      receiverPublicKey: t.receiverPublicKey,
      receiverSignature: t.receiverSignature,
      pledgeTimestamp: t.pledgeTimestamp,
      ackTimestamp: t.ackTimestamp,
    }));

  const syncRes = await apiPost("/offline/sync", { txs });

  if (Array.isArray(syncRes?.confirmed)) {
    for (const id of syncRes.confirmed) await markTxStatus(id, "CONFIRMED");
  }
  if (Array.isArray(syncRes?.failed)) {
    for (const f of syncRes.failed)
      await markTxStatus(f.tx_id, "FAILED", f.reason);
  }

  if (typeof syncRes?.balance === "number") {
    await setLocalBalance(syncRes.balance);
    return { balance: syncRes.balance, synced: toSync.length };
  }

  return { balance: wallet.balance, synced: toSync.length };
}
