const { validationResult } = require("express-validator");
const crypto = require("crypto");

const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../../errors");
const { createJWT } = require("../../utils/jwt");
const User = require("../../models/User");
const sendVerificationEmail = require("../../utils/sendVerficationEmail");

const validateEmailAndPassword = (req) => {
  const { errors } = validationResult(req);
  if (errors.length !== 0) {
    let message = "";
    errors.forEach((err) => {
      message += `${err.msg}: ${err.value}, `;
    });
    throw new BadRequestError(message);
  }
};

const register = async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("All fields required");
  }

  validateEmailAndPassword(req);

  const userExists = await User.findOne({ email });
  if (userExists !== null) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      message: "Email is in use",
    });
  }

  const verificationToken = crypto.randomBytes(40).toString("hex");

  const user = await User.create({ email, password, verificationToken });

  let origin;

  if (process.env.NODE_ENV === "development") {
    origin = "http://localhost:3005";
  } else {
    origin = "http://app.com";
  }

  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
  });

  res.status(StatusCodes.CREATED).json({
    status: true,
    message: "User Created,Email sent, Verify you email",
  });
};

const verifyUser = async (req, res) => {
  const { verificationToken, email } = req.body;

  const user = await User.findOne({ email });
  if (user === null) {
    throw new UnauthenticatedError("User not found");
  }

  if (user.verificationToken !== verificationToken) {
    throw new UnauthenticatedError("verification token not matched");
  }

  user.isVerified = true;
  user.verified = new Date();
  user.verificationToken = "";
  await user.save();

  res.status(StatusCodes.OK).json({ status: true, message: "Email verified" });
};

const login = async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("All fields required");
  }

  validateEmailAndPassword(req);

  let user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(StatusCodes.NON_AUTHORITATIVE_INFORMATION).json({
      status: false,
      message: "invalid credentials",
    });
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return res.status(StatusCodes.NON_AUTHORITATIVE_INFORMATION).json({
      status: false,
      message: "invalid credentials",
    });
  }

  if (user.isVerified === false) {
    throw new UnauthenticatedError("Please verify your email");
  }

  const token = createJWT({
    email: user.email,
    id: user._id,
  });

  user = user.toObject();
  delete user.password;

  res.status(StatusCodes.OK).json({
    status: true,
    message: "login successful",
    user,
    token,
  });
};

module.exports = {
  register,
  login,
  verifyUser,
};
