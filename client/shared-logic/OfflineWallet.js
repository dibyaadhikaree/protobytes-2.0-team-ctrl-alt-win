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
    this.pendingTransactions = []; // Track incomplete transactions
    this.errorLog = []; // Log failures for recovery
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
      
      // Skip signature verification for genesis blocks from SYSTEM
      const isGenesisBlock = block[BLOCK_IDX.FROM] === SYSTEM_CONFIG.GENESIS_SENDER_ID;
      let isValidSig = true;
      
      if (!isGenesisBlock) {
        isValidSig = CryptoHelper.verify(cleanBlock, block[BLOCK_IDX.SIGNATURE], block[BLOCK_IDX.FROM]);
      }
      
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

  // --- 5. NETWORK SYNC LOGIC ---
  // Uploads chain to server for validation and updates balance
  async syncWithServer(apiEndpoint = '/api/offline/sync') {
    const backup = [...this.chain]; // Backup before sync
    
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userPublicKey: this.keys.publicKey,
          chain: this.chain,
          timestamp: Date.now()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        this.resetChain();
        return {
          newBalance: result.newBalance,
          syncedTransactions: result.syncedCount,
          serverTimestamp: result.timestamp
        };
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (error) {
      // Restore backup if sync fails
      this.chain = backup;
      this.logError('syncWithServer', error, [apiEndpoint]);
      throw new Error(`Sync failed: ${error.message}`);
    }
  }

  // --- 6. ERROR HANDLING & LOGGING ---
  // Enhanced error handling wrapper
  safeOperation(operation, ...args) {
    try {
      return operation.apply(this, args);
    } catch (error) {
      this.logError(operation.name, error, args);
      throw error;
    }
  }

  // Log errors for recovery and debugging
  logError(operation, error, args) {
    this.errorLog.push({
      timestamp: Date.now(),
      operation,
      error: error.message,
      args,
      chainSnapshot: [...this.chain],
      id: Math.random().toString(36).substr(2, 9)
    });
    
    // Keep only last 50 errors to prevent memory issues
    if (this.errorLog.length > 50) {
      this.errorLog = this.errorLog.slice(-50);
    }
  }

  // Get recent errors for debugging
  getRecentErrors(limit = 10) {
    return this.errorLog.slice(-limit);
  }

  // Clear error log
  clearErrorLog() {
    this.errorLog = [];
    return true;
  }

  // --- 7. RECOVERY MECHANISMS ---
  // Recover pending/incomplete transactions
  recoverPendingTransactions() {
    const incomplete = this.errorLog.filter(log => 
      log.operation === 'generateBlock' && 
      log.args && log.args.length >= 2
    );
    
    return incomplete.map(log => ({
      receiver: log.args[0],
      amount: log.args[1],
      timestamp: log.timestamp,
      errorId: log.id,
      recoverable: this.canRecover(log)
    }));
  }

  // Check if a transaction can be recovered
  canRecover(errorLog) {
    const currentBalance = this.getBalance();
    return errorLog.args && errorLog.args[1] <= currentBalance;
  }

  // Validate and repair chain integrity
  validateAndRepairChain() {
    const issues = [];
    const validBlocks = [];
    
    for (let i = 0; i < this.chain.length; i++) {
      try {
        const block = this.chain[i];
        const prevBlock = i > 0 ? validBlocks[i-1] : null;
        
        // Re-validate signature
        const cleanBlock = [...block];
        cleanBlock[BLOCK_IDX.SIGNATURE] = "";
        
        // Skip signature verification for genesis blocks from SYSTEM
        const isGenesisBlock = block[BLOCK_IDX.FROM] === SYSTEM_CONFIG.GENESIS_SENDER_ID;
        let isValidSig = true;
        
        if (!isGenesisBlock) {
          isValidSig = CryptoHelper.verify(
            cleanBlock, 
            block[BLOCK_IDX.SIGNATURE], 
            block[BLOCK_IDX.FROM]
          );
        }
        
        if (!isValidSig) {
          issues.push({ index: i, type: 'INVALID_SIGNATURE', block });
          continue;
        }
        
        // Verify hash link
        if (prevBlock) {
          const calculatedPrevHash = CryptoHelper.hash(prevBlock);
          if (block[BLOCK_IDX.PREV_HASH] !== calculatedPrevHash) {
            issues.push({ index: i, type: 'BROKEN_CHAIN_LINK', block });
            continue;
          }
        }
        
        validBlocks.push(block);
      } catch (error) {
        issues.push({ index: i, type: 'CORRUPTED_BLOCK', error, block: this.chain[i] });
      }
    }
    
    // Update chain with only valid blocks
    if (issues.length > 0) {
      this.chain = validBlocks;
      this.logError('validateAndRepairChain', new Error(`Found ${issues.length} issues`), issues);
    }
    
    return { issues, validChain: validBlocks };
  }

  // Retry sync with enhanced error handling
  async retrySync(apiEndpoint) {
    // First validate chain
    const { issues } = this.validateAndRepairChain();
    
    if (issues.length > 0) {
      console.warn(`Chain repaired before sync. Found ${issues.length} issues.`);
    }
    
    return await this.syncWithServer(apiEndpoint);
  }

  // --- 8. RESET WALLET (AFTER SYNC) ---
  // Call this ONLY after the server returns "200 OK"
  resetChain() {
    // We keep the keys, but wipe the transaction history
    this.chain = []; 
    // Option: If you want to keep a local "history" for UI, save it elsewhere before wiping.
    return true; 
  }

}

module.exports = { OfflineWallet };