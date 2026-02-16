const express = require("express");
const { syncOfflineTxs } = require("../controllers/offlineSyncController");
const { protect } = require("../controllers/authController"); // adjust if your protect is elsewhere

const router = express.Router();

router.post("/sync", protect, syncOfflineTxs);

module.exports = router;
