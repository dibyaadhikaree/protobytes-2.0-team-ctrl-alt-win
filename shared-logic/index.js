/**
 * SHARED LOGIC ENTRY POINT
 * Usage: Exports all modules so they can be imported easily.
 * Example: const { OfflineWallet, CryptoHelper } = require('./shared-logic');
 */

const Constants = require('./constants');
const { CryptoHelper } = require('./CryptoHelper');
const { OfflineWallet } = require('./OfflineWallet');
const { QRHandshake } = require('./QRHandshake');

module.exports = {
  // Constants
  SYSTEM_CONFIG: Constants.SYSTEM_CONFIG,
  BLOCK_IDX: Constants.BLOCK_IDX,

  // Classes & Helpers
  CryptoHelper,
  QRHandshake,
  OfflineWallet
};