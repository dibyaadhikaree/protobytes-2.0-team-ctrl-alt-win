const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../models/User");

const MAX_BAL = 1000;

exports.getMyWallet = catchAsync(async (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      userId: req.user._id,
      balance: req.user.balance,
      maxBalance: req.user.maxBalance || MAX_BAL,
    },
  });
});

// dummy load money (online only)
exports.loadMoney = catchAsync(async (req, res, next) => {
  const amount = Number(req.body.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return next(new AppError("Amount must be a positive number", 400));
  }

  const maxBalance = req.user.maxBalance || MAX_BAL;
  const newBalance = Math.min(maxBalance, req.user.balance + amount);

  req.user.balance = newBalance;
  await req.user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    data: {
      userId: req.user._id,
      balance: req.user.balance,
      maxBalance,
      loaded: amount,
      capped: req.user.balance < req.user.balance + amount, // not perfect, optional
    },
  });
});
