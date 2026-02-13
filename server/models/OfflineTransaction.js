const mongoose = require("mongoose");

const OfflineTransactionSchema = new mongoose.Schema(
  {
    // --- A. BLOCK DATA (Immutable - From QR Code) ---
    // These fields match the 'BLOCK_IDX' array positions exactly.

    tx_id: {
      type: String,
      required: true,
      unique: true,
      index: true, // Fast lookups for Sync Status
    },

    senderPublicKey: { type: String, required: true, index: true },
    receiverPublicKey: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    timestamp: { type: Number, required: true }, // Creation time (Phone)

    signature: {
      type: String,
      required: true,
      unique: true, // Absolute protection against duplicate blocks
    },

    prevHash: { type: String, required: true },

    // --- B. SYNC & VERIFICATION STATE (Mutable - Updates on Sync) ---

    // The Lifecycle of the Transaction
    status: {
      type: String,
      enum: [
        "PENDING", // Created but not fully settled (rare in this flow)
        "SENDER_VERIFIED", // Sender synced first (Money locked/deducted)
        "RECEIVER_VERIFIED", // Receiver synced first (Money claimed)
        "COMPLETED", // BOTH have synced (Final Settlement)
        "DISPUTED", // Signature mismatch or logic error
      ],
      default: "PENDING",
      index: true,
    },

    // Track exactly WHO has uploaded this data to the server
    // If array contains both SenderID and ReceiverID -> Status becomes COMPLETED
    syncedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Timestamps for when they actually connected to the internet
    senderSyncTime: { type: Date },
    receiverSyncTime: { type: Date },

    // --- C. AUDIT TRAIL ---
    // If 'DISPUTED', store the error message here
    failureReason: { type: String, default: null },
  },
  { timestamps: true }
);

// --- EFFICIENCY INDEXES ---
// 1. Compound Index: Quickly find "My Completed Transactions"
OfflineTransactionSchema.index({ senderPublicKey: 1, status: 1 });
OfflineTransactionSchema.index({ receiverPublicKey: 1, status: 1 });

module.exports = mongoose.model("OfflineTransaction", OfflineTransactionSchema);
