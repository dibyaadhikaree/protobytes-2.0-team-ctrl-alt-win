import {
  getLocalBalance,
  setLocalBalance,
  getWalletKeys,
  setWalletKeys,
} from "./offlineStore";
import { addPendingTx } from "../offline/queue";
import { getCachedUser } from "./sessionStore";

global.Buffer = global.Buffer || require("buffer").Buffer;

// shared-logic is CommonJS, but export shape may vary.
const CryptoHelperMod = require("../../shared-logic/CryptoHelper.js");
const QRHandshakeMod = require("../../shared-logic/QRHandshake.js");

console.log(QRHandshakeMod);

const CryptoHelper =
  CryptoHelperMod?.CryptoHelper ?? CryptoHelperMod?.default ?? CryptoHelperMod;

const QRHandshake =
  QRHandshakeMod?.QRHandshake ?? QRHandshakeMod?.default ?? QRHandshakeMod;

export type ScanMode = "sender" | "receiver";

// ✅ include from/to so server can update balances
export type PendingTx = {
  tx_id: string;

  from: string; // sender userId
  to: string; // receiver userId

  senderPublicKey: string;
  receiverPublicKey: string;

  amount: number;

  pledgeTimestamp?: number;
  ackTimestamp?: number;

  timestamp?: number; // keep if older data uses this

  senderSignature: string;
  receiverSignature: string;

  status: "PENDING_SYNC";
};

function parseQR(data: string): any {
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function ensureWalletKeys() {
  let keys = await getWalletKeys();
  if (!keys) {
    keys = CryptoHelper.generateKeyPair();
    await setWalletKeys(keys);
  }
  return keys;
}

export async function generatePledgeQR(amount: number) {
  const keys = await ensureWalletKeys();
  const balance = await getLocalBalance();

  const wallet = {
    keys,
    getBalance: () => balance,
  };

  const me = await getCachedUser();
  if (!me?.id) throw new Error("Missing cached user. Login again.");

  // ✅ updated handshake expects senderId
  const pledgeString = QRHandshake.generatePledge(wallet, amount, me.id);

  return pledgeString as string;
}

export async function handleScannedQR(mode: ScanMode, scannedString: string) {
  const payload = parseQR(scannedString);
  if (!payload) throw new Error("Invalid QR: not JSON");

  console.log("PLEDGE PAYLOAD:", payload);
  console.log("PLEDGE from:", payload.from);

  const keys = await ensureWalletKeys();
  const me = await getCachedUser();
  if (!me?.id) throw new Error("Missing cached user. Login again.");

  // -------------------------
  // RECEIVER: scan PLEDGE -> create ACK -> store pending -> increase local balance
  // -------------------------
  if (mode === "receiver") {
    if (payload.protocol !== "PLEDGE") {
      throw new Error("Receiver must scan a PLEDGE QR.");
    }

    const wallet = { keys };

    // ✅ pass receiverId so ACK contains "to"
    const ackString = QRHandshake.processPledgeAndCreateAck(
      wallet,
      scannedString,
      me.id
    );

    console.log("ACK STRING RAW:", ackString);
    const ackObj = JSON.parse(ackString);
    console.log("ACK OBJ KEYS:", Object.keys(ackObj));
    console.log("ACK from/to:", ackObj.from, ackObj.to);

    // ✅ decode returns {tx_id, from, to, ...}
    const decoded = QRHandshake.decodeAckToStorageFormat(ackString);

    // normalize fields
    const tx: PendingTx = {
      tx_id: decoded.tx_id,
      from: decoded.from,
      to: decoded.to,
      senderPublicKey: decoded.senderPublicKey,
      receiverPublicKey: decoded.receiverPublicKey,
      amount: Number(decoded.amount),

      pledgeTimestamp: decoded.pledgeTimestamp,
      ackTimestamp: decoded.ackTimestamp,

      senderSignature: decoded.senderSignature,
      receiverSignature: decoded.receiverSignature,

      status: "PENDING_SYNC",
    };

    if (!tx.from || !tx.to) {
      throw new Error("Invalid ACK storage format: missing from/to");
    }

    await addPendingTx(tx);

    // optimistic local balance (+)
    const bal = await getLocalBalance();
    await setLocalBalance(bal + tx.amount);

    return { action: "SHOW_ACK" as const, ackString, tx };
  }

  // -------------------------
  // SENDER: scan ACK -> finalize -> store pending -> decrease local balance
  // -------------------------
  if (mode === "sender") {
    if (payload.protocol !== "ACK") {
      throw new Error("Sender must scan an ACK QR.");
    }

    const balance = await getLocalBalance();

    const wallet = {
      keys,
      getBalance: () => balance,
    };

    // ✅ pass senderId so handshake verifies ack.from matches me.id
    const finalized = QRHandshake.processAckAndFinalize(
      wallet,
      scannedString,
      me.id
    );

    const tx: PendingTx = {
      tx_id: finalized.tx_id,
      from: finalized.from,
      to: finalized.to,
      senderPublicKey: finalized.senderPublicKey,
      receiverPublicKey: finalized.receiverPublicKey,
      amount: Number(finalized.amount),

      pledgeTimestamp: finalized.pledgeTimestamp,
      ackTimestamp: finalized.ackTimestamp,

      senderSignature: finalized.senderSignature,
      receiverSignature: finalized.receiverSignature,

      status: "PENDING_SYNC",
    };

    if (!tx.from || !tx.to) {
      throw new Error("Finalized tx missing from/to. Update QRHandshake.");
    }

    // optimistic local balance (-)
    if (balance < tx.amount) {
      throw new Error("Local balance insufficient (sync required).");
    }

    await addPendingTx(tx);
    await setLocalBalance(balance - tx.amount);

    return { action: "FINALIZED" as const, tx };
  }

  throw new Error("Unknown scan mode");
}
