/**
 * SHARED CRYPTO HELPER
 * Usage: Handles Key Generation, Signing (Ed25519), and Hashing (SHA-512).
 * Dependencies: tweetnacl, tweetnacl-util
 */

const nacl = require('tweetnacl');          // Import the core crypto library
const util = require('tweetnacl-util');     // Import helper for string encoding

const CryptoHelper = {

  // --- HELPER UTILS (Internal) ---
  // Converts a String to Uint8Array (Raw Bytes)
  encode: (str) => util.decodeUTF8(str),

  // Converts Raw Bytes back to String
  decode: (u8) => util.encodeUTF8(u8),

  // Converts Raw Bytes to Base64 String (for easy storage in DB/QR)
  toBase64: (u8) => util.encodeBase64(u8),

  // Converts Base64 String back to Raw Bytes
  fromBase64: (str) => util.decodeBase64(str),


  // --- 1. GENERATE KEYS ---
  // Creates a new Public/Private key pair for a user.
  generateKeyPair: () => {
    const keys = nacl.sign.keyPair(); // Generate random Ed25519 keys
    return {
      publicKey: util.encodeBase64(keys.publicKey), // Public ID (Safe to share)
      secretKey: util.encodeBase64(keys.secretKey)  // Private Password (Keep local!)
    };
  },


  // --- 2. SIGN DATA ---
  // Creates a digital signature for a piece of data using the Secret Key.
  // Returns: The Signature String (Base64)
  sign: (data, secretKeyB64) => {
    try {
      const dataStr = JSON.stringify(data);                 // Convert Array/Object to string
      const dataBytes = util.decodeUTF8(dataStr);           // Convert string to bytes
      const secretKey = util.decodeBase64(secretKeyB64);    // Decode the key

      // Sign the data (detached means we get just the signature, not data+sig)
      const signature = nacl.sign.detached(dataBytes, secretKey);
      
      return util.encodeBase64(signature);                  // Return signature as string
    } catch (e) {
      console.error("Signing Error:", e);
      return null;
    }
  },


  // --- 3. VERIFY SIGNATURE ---
  // Checks if data was truly signed by the owner of the Public Key.
  // Returns: true (Valid) or false (Fake/Tampered)
  verify: (data, signatureB64, publicKeyB64) => {
    try {
      const dataStr = JSON.stringify(data);                 // Convert Array/Object to string
      const dataBytes = util.decodeUTF8(dataStr);           // Convert string to bytes
      const signature = util.decodeBase64(signatureB64);    // Decode the signature
      const publicKey = util.decodeBase64(publicKeyB64);    // Decode the public key

      // Verify using NaCl
      return nacl.sign.detached.verify(dataBytes, signature, publicKey);
    } catch (e) {
      return false; // Any error means the signature is invalid
    }
  },


  // --- 4. HASH DATA ---
  // Creates a unique "Fingerprint" of any data (SHA-512).
  // Used to link Block B to Block A (The "Chain" part).
  hash: (data) => {
    const dataStr = JSON.stringify(data);                 // Convert data to string
    const dataBytes = util.decodeUTF8(dataStr);           // Convert string to bytes
    const hashBytes = nacl.hash(dataBytes);               // Hash it
    return util.encodeBase64(hashBytes);                  // Return hash as Base64
  }
};

// Export the object so other files can use it
module.exports = { CryptoHelper };