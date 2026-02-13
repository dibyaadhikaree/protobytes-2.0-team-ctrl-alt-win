const catchAsync = require("../utils/catchAsync");
const User = require("../models/User");
const AppError = require("../utils/appError");
const jwt = require("jsonwebtoken");

// Create JWT token for user
const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET);
};

const register = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, phoneNumber } = req.body;

  const freshUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    phoneNumber,
  });

  freshUser.password = undefined;

  res.status(200).json({
    status: "success",
    data: freshUser,
    token: createToken(freshUser._id),
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new AppError("Please enter your email or password", 400);

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password)))
    throw new AppError("Invalid email or password", 401);

  user.password = undefined;

  res.status(200).json({
    status: "success",
    user,
    token: createToken(user._id),
  });
});

const protect = catchAsync(async (req, res, next) => {
  //verify jwt token

  let token;

  console.log(req.headers.authorization);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else
    throw new AppError(
      "You are not logged in, Please login to continue (No bearer token in headers)",
      401
    );

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) throw new AppError("The user doesnt exist any more ", 404);

  req.user = currentUser.toObject(); //doing this because currentUser is  a mongoose _doc , it includes its methods and validators and setter , getter
  req.user.id = currentUser._id;

  next();
});

const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) throw new AppError("You are not logged in ", 401);

    // Check if user's role(s) match any of the allowed roles
    const userRoles = Array.isArray(req.user.role)
      ? req.user.role
      : [req.user.role];
    const hasPermission = userRoles.some((role) => roles.includes(role));

    if (!hasPermission) {
      throw new AppError("You are not authorized to view this", 403);
    }

    next();
  };

const getMe = catchAsync(async (req, res, next) => {
  // req.user comes from protect middleware
  const user = req.user;
  if (user.password) delete user.password;

  res.status(200).json({
    status: "success",
    user,
  });
});

module.exports = { register, login, protect, restrictTo, getMe };
