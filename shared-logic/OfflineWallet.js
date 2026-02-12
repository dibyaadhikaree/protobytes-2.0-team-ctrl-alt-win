/**
 * SHARED LOGIC: OFFLINE WALLET
 * Usage: Manages the "Chain of Trust". 
 * - Generates payment blocks (sender).
 * - Validates incoming chains (receiver).
 * Dependencies: constants.js, CryptoHelper.js
 */

const { SYSTEM_CONFIG, BLOCK_IDX } = require('./constants');
const { CryptoHelper } = require('./CryptoHelper');

class OfflineWallet {
  
  // 1. CONSTRUCTOR
  // userKeys: { publicKey, secretKey } - The current user's keys
  // chain: Array of Blocks - The current history of money this user holds
  constructor(userKeys, chain = []) {
    this.keys = userKeys;
    this.chain = chain;
  }

  // --- 2. GET BALANCE ---
  // Loops through the chain to see how much money is currently "owned" by this user.
  getBalance() {
    let balance = 0;
    const myPub = this.keys.publicKey;

    // Iterate through every block in the history
    this.chain.forEach(block => {
      // If I am the Receiver (Index 2) -> I gained money
      if (block[BLOCK_IDX.TO] === myPub) {
        balance += block[BLOCK_IDX.AMOUNT];
      }
      // If I am the Sender (Index 1) -> I lost money
      if (block[BLOCK_IDX.FROM] === myPub) {
        balance -= block[BLOCK_IDX.AMOUNT];
      }
    });
    return balance;
  }

  // --- 3. GENERATE PAYMENT QR (SENDER) ---
  // Creates a new block that pays 'amount' to 'receiverPub'.
  // Returns: JSON String of the NEW full chain.
  generateBlock(receiverPub, amount) {
    // A. VALIDATION CHECKS
    const currentBalance = this.getBalance();
    if (currentBalance < amount) {
      throw new Error(`Insufficient Balance. You have ${currentBalance}, trying to send ${amount}.`);
    }
    
    // Check Chain Limit (The 10-Hop Rule)
    if (this.chain.length >= SYSTEM_CONFIG.MAX_HOPS) {
      throw new Error(`Offline Chain Full (${this.chain.length}/${SYSTEM_CONFIG.MAX_HOPS}). Connect to Internet to Sync.`);
    }

    // B. PREPARE NEW BLOCK DATA
    // We need the hash of the PREVIOUS block to link them together.
    const lastBlock = this.chain[this.chain.length - 1];
    const prevHash = lastBlock ? CryptoHelper.hash(lastBlock) : "GENESIS_HASH"; // If no history, it's the first block.
    
    // Create the Block Array (See constants.js for index mapping)
    const blockData = [
      Math.floor(Math.random() * 1000000000).toString(), // 0: TX_ID (Random Int)
      this.keys.publicKey,                               // 1: FROM (Me)
      receiverPub,                                       // 2: TO (Receiver)
      amount,                                            // 3: AMOUNT
      Date.now(),                                        // 4: TIMESTAMP
      "",                                                // 5: SIGNATURE (Empty for now)
      prevHash                                           // 6: PREV_HASH
    ];

    // C. SIGN THE BLOCK
    // We sign the array (with empty signature field) to prove we authorized this data.
    const signature = CryptoHelper.sign(blockData, this.keys.secretKey);
    blockData[BLOCK_IDX.SIGNATURE] = signature; // Fill in the signature

    // D. RETURN FULL CHAIN
    // The Receiver needs my entire history + this new block to verify I had funds.
    const newChain = [...this.chain, blockData];
    return JSON.stringify(newChain);
  }

  // --- 4. VALIDATE INCOMING QR (RECEIVER) ---
  // Checks if the scanned QR is valid and if the sender actually had money.
  // Returns: The valid Chain Object (if good) or Throws Error (if bad).
  validateIncomingChain(qrString) {
    let incomingChain;
    try {
      incomingChain = JSON.parse(qrString);
    } catch (e) {
      throw new Error("Invalid QR Format: Not JSON");
    }

    // Check 1: Is it an Array?
    if (!Array.isArray(incomingChain)) throw new Error("Invalid QR: Data is not a Chain");

    // Check 2: Chain Length Limit
    if (incomingChain.length > SYSTEM_CONFIG.MAX_HOPS) {
      throw new Error("Chain too long. Sender must sync online.");
    }

    // Check 3: VERIFY EVERY BLOCK (The Loop)
    // We must ensure the history wasn't tampered with.
    for (let i = 0; i < incomingChain.length; i++) {
      const block = incomingChain[i];
      const prevBlock = i > 0 ? incomingChain[i-1] : null;

      // A. Verify Signature
      // To verify, we must recreate the data EXACTLY as it was signed (with empty sig field).
      const cleanBlock = [...block]; 
      cleanBlock[BLOCK_IDX.SIGNATURE] = ""; 
      
      const isValidSig = CryptoHelper.verify(cleanBlock, block[BLOCK_IDX.SIGNATURE], block[BLOCK_IDX.FROM]);
      if (!isValidSig) {
        throw new Error(`Security Alert: Invalid Signature at Block #${i + 1}`);
      }

      // B. Verify Hash Link (Chain Integrity)
      // Does this block correctly point to the previous one?
      if (prevBlock) {
        const calculatedPrevHash = CryptoHelper.hash(prevBlock);
        if (block[BLOCK_IDX.PREV_HASH] !== calculatedPrevHash) {
          throw new Error(`Security Alert: Broken Chain Link at Block #${i + 1}`);
        }
      }
    }

    // If the loop finishes without error, the chain is valid.
    return incomingChain;
  }

  // --- 5. RESET WALLET (AFTER SYNC) ---
  // Call this ONLY after the server returns "200 OK"
  resetChain() {
    // We keep the keys, but wipe the transaction history
    this.chain = []; 
    // Option: If you want to keep a local "history" for UI, save it elsewhere before wiping.
    return true; 
  }

}

module.exports = { OfflineWallet };