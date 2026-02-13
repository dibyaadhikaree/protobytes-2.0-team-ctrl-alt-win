const { CryptoHelper } = require('./CryptoHelper');
const { OfflineWallet } = require('./OfflineWallet');

class QRHandshake {

    // --- STEP 1: SENDER GENERATES PLEDGE ---
    // User inputs amount -> Returns QR String
    static generatePledge(wallet, amount) {
        // 1. Check Balance using existing logic
        if (wallet.getBalance() < amount) {
            throw new Error("Insufficient Balance");
        }

        // 2. Create Unique Transaction Data
        const txId = Math.floor(Math.random() * 1000000000).toString();
        const timestamp = Date.now();
        
        // Data to sign: "I pledge to pay [amount] in [txId]"
        const dataToSign = [txId, wallet.keys.publicKey, amount.toString(), timestamp.toString()];
        const signature = CryptoHelper.sign(dataToSign, wallet.keys.secretKey);

        const pledgeObject = {
            protocol: "PLEDGE",
            txId: txId,
            senderPub: wallet.keys.publicKey,
            amount: amount,
            timestamp: timestamp,
            senderSig: signature
        };

        return JSON.stringify(pledgeObject);
    }

    // --- STEP 2: RECEIVER SCANS PLEDGE & GENERATES ACK ---
    // Scans Sender's QR -> Verifies -> Returns ACK QR String
    static processPledgeAndCreateAck(wallet, pledgeString) {
        let pledge;
        try { pledge = JSON.parse(pledgeString); } 
        catch (e) { throw new Error("Invalid QR: Not JSON"); }

        if (pledge.protocol !== "PLEDGE") throw new Error("QR is not a Payment Pledge");

        // 1. Verify Sender's Signature
        const dataToCheck = [pledge.txId, pledge.senderPub, pledge.amount.toString(), pledge.timestamp.toString()];
        const isValid = CryptoHelper.verify(dataToCheck, pledge.senderSig, pledge.senderPub);
        
        if (!isValid) throw new Error("Security Alert: Fake Sender Signature");

        // 2. Generate Acknowledgement (Ack)
        // "I (Receiver) accept [txId] from [Sender]"
        const ackData = [pledge.txId, pledge.senderPub, wallet.keys.publicKey, pledge.amount.toString()];
        const receiverSig = CryptoHelper.sign(ackData, wallet.keys.secretKey);

        const ackObject = {
            protocol: "ACK",
            txId: pledge.txId,
            senderPub: pledge.senderPub,
            receiverPub: wallet.keys.publicKey,
            amount: pledge.amount,
            timestamp: pledge.timestamp,
            senderSig: pledge.senderSig,   // Keep original proof
            receiverSig: receiverSig       // Add my proof
        };

        // 3. Return string to show on Receiver's screen
        return JSON.stringify(ackObject);
    }

    // --- STEP 3: SENDER SCANS ACK & FINALIZES ---
    // Scans Receiver's QR -> Verifies -> Returns Final Transaction Data (for DB)
    static processAckAndFinalize(wallet, ackString) {
        let ack;
        try { ack = JSON.parse(ackString); } 
        catch (e) { throw new Error("Invalid QR: Not JSON"); }

        if (ack.protocol !== "ACK") throw new Error("QR is not an Acknowledgement");

        // 1. Verify it matches MY transaction
        // (In a real app, you would check if 'txId' matches the one you just generated)
        if (ack.senderPub !== wallet.keys.publicKey) {
            throw new Error("Wrong Transaction: This payment is not from you.");
        }

        // 2. Verify Receiver's Signature
        const dataToCheck = [ack.txId, ack.senderPub, ack.receiverPub, ack.amount.toString()];
        const isValid = CryptoHelper.verify(dataToCheck, ack.receiverSig, ack.receiverPub);

        if (!isValid) throw new Error("Security Alert: Fake Receiver Signature");

        // 3. Success! Return the data formatted for the Database
        return {
            tx_id: ack.txId,
            senderPublicKey: ack.senderPub,
            receiverPublicKey: ack.receiverPub,
            amount: ack.amount,
            timestamp: ack.timestamp,
            senderSignature: ack.senderSig,
            receiverSignature: ack.receiverSig,
            status: "COMPLETED_OFFLINE"
        };
    }

    // --- HELPER: CONVERT ACK STRING TO DB FORMAT (FOR RECEIVER) ---
    // Usage: Call this immediately after generating the Ack QR to save data.
    static decodeAckToStorageFormat(ackString) {
        let ack;
        try { ack = JSON.parse(ackString); } 
        catch (e) { throw new Error("Invalid Ack String"); }

        // Map the QR short-codes to your Database Schema names
        return {
            tx_id: ack.txId,
            senderPublicKey: ack.senderPub,
            receiverPublicKey: ack.receiverPub,
            amount: ack.amount,
            timestamp: ack.timestamp,
            senderSignature: ack.senderSig,
            receiverSignature: ack.receiverSig,
            status: "COMPLETED_OFFLINE"
        };
    }
}

module.exports = { QRHandshake };