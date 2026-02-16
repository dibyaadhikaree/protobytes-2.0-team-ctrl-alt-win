const mongoose = require("mongoose");
const OfflineTransfer = require("../models/OfflineTransfer");
const User = require("../models/User");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

// Hackathon/basic validation (structure only)
// Later you can add tweetnacl verification using public keys + signatures.
function basicVerify(tx) {
  if (!tx.tx_id) return { ok: false, reason: "Missing tx_id" };
  if (!tx.from) return { ok: false, reason: "Missing from (senderId)" };
  if (!tx.to) return { ok: false, reason: "Missing to (receiverId)" };

  const amount = Number(tx.amount);
  if (!Number.isFinite(amount) || amount <= 0)
    return { ok: false, reason: "Invalid amount" };

  if (!tx.senderPublicKey || !tx.senderSignature) {
    return { ok: false, reason: "Missing sender proof" };
  }
  if (!tx.receiverPublicKey || !tx.receiverSignature) {
    return { ok: false, reason: "Missing receiver proof" };
  }

  return { ok: true };
}

exports.syncOfflineTxs = catchAsync(async (req, res, next) => {
  const txs = req.body?.txs;
  if (!Array.isArray(txs) || txs.length === 0) {
    return next(new AppError("No transactions to sync", 400));
  }

  const confirmed = [];
  const failed = [];

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const tx of txs) {
      const txId = tx.tx_id;
      const senderId = tx.from;
      const receiverId = tx.to;
      const amount = Number(tx.amount);

      try {
        const v = basicVerify(tx);
        if (!v.ok) throw new Error(v.reason);

        // ✅ Idempotency: if tx already applied, do nothing (but mark confirmed)
        const already = await OfflineTransfer.findOne({ txId }).session(
          session
        );
        if (already) {
          confirmed.push(txId);
          continue;
        }

        // ✅ Check sender has enough balance
        const sender = await User.findById(senderId).session(session);
        if (!sender) throw new Error("Sender not found");

        const senderBal =
          typeof sender.balance === "number" ? sender.balance : 0;
        if (senderBal < amount) throw new Error("Insufficient sender balance");

        // ✅ Apply balance updates atomically
        await User.updateOne(
          { _id: senderId },
          { $inc: { balance: -amount } },
          { session }
        );

        await User.updateOne(
          { _id: receiverId },
          { $inc: { balance: amount } },
          { session }
        );

        // ✅ Store transfer record (audit)
        await OfflineTransfer.create(
          [
            {
              txId,
              senderId,
              receiverId,
              amount,
              pledge: {
                senderPublicKey: tx.senderPublicKey,
                senderSignature: tx.senderSignature,
                pledgeTimestamp: tx.pledgeTimestamp ?? null,
              },
              ack: {
                receiverPublicKey: tx.receiverPublicKey,
                receiverSignature: tx.receiverSignature,
                ackTimestamp: tx.ackTimestamp ?? null,
              },
              status: "CONFIRMED",
            },
          ],
          { session }
        );

        confirmed.push(txId);
      } catch (err) {
        failed.push({ tx_id: txId || null, reason: err?.message || "Failed" });

        // Optional: store FAILED tx if txId exists and not stored
        if (txId) {
          const exists = await OfflineTransfer.findOne({ txId }).session(
            session
          );
          if (!exists) {
            await OfflineTransfer.create(
              [
                {
                  txId,
                  senderId: senderId || req.user?.id,
                  receiverId: receiverId || req.user?.id,
                  amount: Number.isFinite(amount) ? amount : 0,
                  pledge: {
                    senderPublicKey: tx.senderPublicKey || null,
                    senderSignature: tx.senderSignature || null,
                    pledgeTimestamp: tx.pledgeTimestamp ?? null,
                  },
                  ack: {
                    receiverPublicKey: tx.receiverPublicKey || null,
                    receiverSignature: tx.receiverSignature || null,
                    ackTimestamp: tx.ackTimestamp ?? null,
                  },
                  status: "FAILED",
                  reason: err?.message || "Failed",
                },
              ],
              { session }
            );
          }
        }
      }
    }

    await session.commitTransaction();
    session.endSession();

    // ✅ Return updated balance for logged-in user
    const me = await User.findById(req.user.id);
    const myBalance = me?.balance ?? null;

    return res.status(200).json({
      status: "success",
      data: {
        balance: myBalance,
        confirmed,
        failed,
      },
    });
  } catch (e) {
    await session.abortTransaction();
    session.endSession();
    return next(e);
  }
});
