// client/shared-logic/QRHandshake.js
// ✅ v2: includes from/to userIds so server can update balances on sync

const { CryptoHelper } = require("./CryptoHelper");
const { OfflineWallet } = require("./OfflineWallet"); // kept (not required here, but you had it)

class QRHandshake {
  // --- STEP 1: SENDER GENERATES PLEDGE ---
  // User inputs amount -> Returns QR String
  // ✅ senderId required (maps to User._id on server)
  static generatePledge(wallet, amount, senderId) {
    if (!senderId) throw new Error("Missing senderId");
    if (!wallet?.keys?.publicKey || !wallet?.keys?.secretKey) {
      throw new Error("Wallet keys missing");
    }
    if (typeof wallet.getBalance !== "function") {
      throw new Error("wallet.getBalance() missing");
    }
    if (wallet.getBalance() < amount) {
      throw new Error("Insufficient Balance");
    }

    const txId = Math.floor(Math.random() * 1000000000).toString();
    const timestamp = Date.now();

    // ✅ include senderId in signed data
    const dataToSign = [
      txId,
      senderId,
      wallet.keys.publicKey,
      amount.toString(),
      timestamp.toString(),
    ];
    const signature = CryptoHelper.sign(dataToSign, wallet.keys.secretKey);

    const pledgeObject = {
      v: 1,
      protocol: "PLEDGE",
      txId,
      from: senderId, // ✅ sender userId
      senderPub: wallet.keys.publicKey,
      amount,
      timestamp,
      senderSig: signature,
    };

    return JSON.stringify(pledgeObject);
  }

  // --- STEP 2: RECEIVER SCANS PLEDGE & GENERATES ACK ---
  // ✅ receiverId required (maps to User._id on server)
  static processPledgeAndCreateAck(wallet, pledgeString, receiverId) {
    if (!receiverId) throw new Error("Missing receiverId");
    if (!wallet?.keys?.publicKey || !wallet?.keys?.secretKey) {
      throw new Error("Wallet keys missing");
    }

    let pledge;
    try {
      pledge = JSON.parse(pledgeString);
    } catch (e) {
      throw new Error("Invalid QR: Not JSON");
    }

    if (pledge.protocol !== "PLEDGE")
      throw new Error("QR is not a Payment Pledge");
    if (!pledge.from)
      throw new Error("Invalid Pledge: Missing senderId (from)");

    // 1) Verify Sender's Signature
    const dataToCheck = [
      pledge.txId,
      pledge.from,
      pledge.senderPub,
      pledge.amount.toString(),
      pledge.timestamp.toString(),
    ];

    const isValid = CryptoHelper.verify(
      dataToCheck,
      pledge.senderSig,
      pledge.senderPub
    );
    if (!isValid) throw new Error("Security Alert: Fake Sender Signature");

    // 2) Generate ACK
    const ackTimestamp = Date.now();

    const ackData = [
      pledge.txId,
      pledge.from, // sender userId
      receiverId, // receiver userId
      pledge.senderPub, // sender pub
      wallet.keys.publicKey, // receiver pub
      pledge.amount.toString(),
      ackTimestamp.toString(),
    ];

    const receiverSig = CryptoHelper.sign(ackData, wallet.keys.secretKey);

    const ackObject = {
      v: 1,
      protocol: "ACK",
      txId: pledge.txId,

      from: pledge.from, // ✅ sender userId
      to: receiverId, // ✅ receiver userId

      senderPub: pledge.senderPub,
      receiverPub: wallet.keys.publicKey,

      amount: pledge.amount,

      pledgeTimestamp: pledge.timestamp,
      ackTimestamp,

      senderSig: pledge.senderSig,
      receiverSig: receiverSig,
    };

    return JSON.stringify(ackObject);
  }

  // --- STEP 3: SENDER SCANS ACK & FINALIZES ---
  // ✅ senderId required to ensure the ACK is meant for this sender account
  static processAckAndFinalize(wallet, ackString, senderId) {
    if (!senderId) throw new Error("Missing senderId");
    if (!wallet?.keys?.publicKey || !wallet?.keys?.secretKey) {
      throw new Error("Wallet keys missing");
    }
    if (typeof wallet.getBalance !== "function") {
      throw new Error("wallet.getBalance() missing");
    }

    let ack;
    try {
      ack = JSON.parse(ackString);
    } catch (e) {
      throw new Error("Invalid QR: Not JSON");
    }

    if (ack.protocol !== "ACK") throw new Error("QR is not an Acknowledgement");

    // Must match my sender public key + sender user id
    if (ack.senderPub !== wallet.keys.publicKey) {
      throw new Error("Wrong Transaction: This payment is not from you.");
    }
    if (ack.from !== senderId) {
      throw new Error("Wrong Sender: ACK not meant for this sender.");
    }
    if (!ack.to) throw new Error("Invalid ACK: Missing receiverId (to)");

    // Verify Receiver's Signature
    const dataToCheck = [
      ack.txId,
      ack.from,
      ack.to,
      ack.senderPub,
      ack.receiverPub,
      ack.amount.toString(),
      ack.ackTimestamp.toString(),
    ];

    const isValid = CryptoHelper.verify(
      dataToCheck,
      ack.receiverSig,
      ack.receiverPub
    );
    if (!isValid) throw new Error("Security Alert: Fake Receiver Signature");

    // Return storage format containing from/to
    return {
      tx_id: ack.txId,

      from: ack.from,
      to: ack.to,

      senderPublicKey: ack.senderPub,
      receiverPublicKey: ack.receiverPub,

      amount: ack.amount,

      pledgeTimestamp: ack.pledgeTimestamp,
      ackTimestamp: ack.ackTimestamp,

      senderSignature: ack.senderSig,
      receiverSignature: ack.receiverSig,

      status: "PENDING_SYNC",
    };
  }

  // --- HELPER: Receiver converts ACK string to storage format ---
  static decodeAckToStorageFormat(ackString) {
    let ack;
    try {
      ack = JSON.parse(ackString);
    } catch (e) {
      throw new Error("Invalid Ack String");
    }

    if (!ack.from || !ack.to) throw new Error("Invalid ACK: missing from/to");

    return {
      tx_id: ack.txId,

      from: ack.from,
      to: ack.to,

      senderPublicKey: ack.senderPub,
      receiverPublicKey: ack.receiverPub,

      amount: ack.amount,

      pledgeTimestamp: ack.pledgeTimestamp,
      ackTimestamp: ack.ackTimestamp,

      senderSignature: ack.senderSig,
      receiverSignature: ack.receiverSig,

      status: "PENDING_SYNC",
    };
  }
}

module.exports = { QRHandshake };
