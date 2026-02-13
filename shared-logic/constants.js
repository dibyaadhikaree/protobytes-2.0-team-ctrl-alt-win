/**
 * SHARED CONSTANTS
 * Usage: Holds the rules and data structures used by both App and Server.
 */

// 1. Define the System Configuration Rules
const SYSTEM_CONFIG = {
  MAX_HOPS: 11,                 // Limit the offline chain to 10 transfers to keep QR scanning fast.
  COMMISSION_FEE: 5,            // The fee (in Rs) deducted when loading money from Bank to Offline.
  OFFLINE_LIMIT: 1000,          // The maximum balance (in Rs) a user is allowed to hold offline.
  GENESIS_SENDER_ID: "SYSTEM",  // The unique ID used to identify money loaded from the Server.
  VERSION: "v1"                 // Protocol version; prevents errors if we update the app later.
};

// 2. Define the Array Indices for the QR Data Block
// We use an Array [a, b, c] instead of Object {a:1, b:2} to save bytes in the QR code.
const BLOCK_IDX = {
  TX_ID: 0,       // Index 0: Unique Transaction ID (UUID)
  FROM: 1,        // Index 1: Sender's Public Key
  TO: 2,          // Index 2: Receiver's Public Key
  AMOUNT: 3,      // Index 3: Amount Transferred
  TIMESTAMP: 4,   // Index 4: Time of transaction (Unix Epoch)
  SIGNATURE: 5,   // Index 5: The Sender's Cryptographic Signature
  PREV_HASH: 6    // Index 6: Hash of the previous block (Links the chain)
};

// 3. Export these objects so other files can require() them
module.exports = { 
  SYSTEM_CONFIG, 
  BLOCK_IDX 
};