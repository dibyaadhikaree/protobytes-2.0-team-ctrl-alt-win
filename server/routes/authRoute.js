const express = require("express");
const router = express.Router();

const {
  login,
  register,
  switchRole,
  protect,
} = require("../controllers/authController");
const User = require("../models/User");

router.route("/login").post(login);

router.route("/register").post(register);

router.route("/users").get(async (req, res, next) => {
  res.json({ users: await User.find({}) });
});

module.exports = router;
