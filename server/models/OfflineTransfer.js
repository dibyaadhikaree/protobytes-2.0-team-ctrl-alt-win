const mongoose = require("mongoose");

const offlineTransferSchema = new mongoose.Schema(
  {
    txId: { type: String, required: true, unique: true, index: true },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: { type: Number, required: true },

    pledge: { type: Object, required: true },
    ack: { type: Object, required: true },

    status: {
      type: String,
      enum: ["CONFIRMED", "FAILED"],
      default: "CONFIRMED",
    },
    reason: { type: String },

    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OfflineTransfer", offlineTransferSchema);
