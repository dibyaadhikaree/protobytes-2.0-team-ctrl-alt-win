const express = require("express");
const authController = require("../controllers/authController");
const walletController = require("../controllers/walletController");

const router = express.Router();

router.use(authController.protect);

router.get("/me", walletController.getMyWallet);
router.post("/load", walletController.loadMoney);

module.exports = router;
