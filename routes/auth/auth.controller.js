const { validationResult } = require('express-validator');
const crypto = require('crypto');

const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../../errors');
const { createJWT } = require('../../utils/jwt');
const User = require('../../models/User');
const sendVerificationEmail = require('../../utils/sendVerficationEmail');
const sendResetPasswordEmail = require('../../utils/sendResetPasswordEmail');
const Wallet = require('../../models/Wallet');

const validateEmailAndPassword = req => {
  const { errors } = validationResult(req);
  if (errors.length !== 0) {
    let message = '';
    errors.forEach(err => {
      message += `${err.msg}: ${err.value}, `;
    });
    throw new BadRequestError(message);
  }
};

const createHash = string => crypto.createHash('md5').update(string).digest('hex');

const register = async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('All fields required');
  }

  validateEmailAndPassword(req);

  const userExists = await User.findOne({ email });
  if (userExists !== null) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      message: 'Email address is already exist',
    });
  }

  const verificationToken = crypto.randomBytes(40).toString('hex');

  const user = await User.create({ email, password, verificationToken });

  let origin;

  if (process.env.NODE_ENV === 'development') {
    origin = 'http://localhost:3000';
  } else {
    origin = process.env.ORIGIN;
  }

  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    origin,
  });

  res.status(StatusCodes.CREATED).json({
    status: true,
    message: 'User Created,Email sent, Verify you email',
  });
};

const verifyUser = async (req, res) => {
  const { verificationToken, email } = req.body;

  const user = await User.findOne({ email }).select('+verificationToken');

  if (user === null) {
    throw new UnauthenticatedError('User not found');
  }

  if (user.verificationToken !== verificationToken) {
    throw new UnauthenticatedError('verification token not matched');
  }

  user.isVerified = true;
  user.verified = new Date();
  user.verificationToken = null;
  await user.save();
  // await Wallet.create({ userId: user._id, balance: 0 });

  res.status(StatusCodes.OK).json({ status: true, message: 'Email verified' });
};

const login = async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError('All fields required');
  }

  validateEmailAndPassword(req);

  let user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(StatusCodes.NON_AUTHORITATIVE_INFORMATION).json({
      status: false,
      message: 'invalid credentials',
    });
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return res.status(StatusCodes.NON_AUTHORITATIVE_INFORMATION).json({
      status: false,
      message: 'invalid credentials',
    });
  }

  if (user.isVerified === false) {
    throw new UnauthenticatedError('Please verify your email');
  }

  const token = createJWT({
    email: user.email,
    id: user._id,
  });

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 100),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  user = user.toObject();
  delete user.password;

  // res.cookie("token", token, cookieOptions);
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'login successful',
    user,
    token,
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BadRequestError('Provide valid email');
  }

  const user = await User.findOne({ email });

  if (user === null) {
    throw new NotFoundError('User not found');
  }

  const passwordToken = crypto.randomBytes(70).toString('hex');

  const twentyMinutes = 1000 * 60 * 20;

  const passwordTokenExpirationDate = new Date(Date.now() + twentyMinutes);

  let origin;

  if (process.env.NODE_ENV === 'development') {
    origin = 'http://localhost:3005';
  } else {
    origin = process.env.ORIGIN;
  }

  await sendResetPasswordEmail({
    name: user?.lastname,
    email: user.email,
    token: passwordToken,
    origin,
  });

  user.passwordToken = createHash(passwordToken);
  user.passwordTokenExpirationDate = passwordTokenExpirationDate;
  await user.save();

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Email sent',
  });
};

const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;
  if (!token || !email || !password) {
    throw new BadRequestError('All fields required');
  }

  const user = await User.findOne({ email });

  if (user) {
    const currentTime = new Date();
    if (user.passwordToken === createHash(token) && user.passwordTokenExpirationDate > currentTime) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
      res.status(StatusCodes.OK).json({
        status: true,
        message: 'password reset',
      });
    } else {
      throw new BadRequestError('Something goes wrong, try again');
    }
  }
};

const changePassword = async (req, res) => {
  let { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new BadRequestError('All fields required');
  }
  let user = await User.findOne({ _id: req.user._id }).select('+password');

  if (!user) {
    return res.status(StatusCodes.NON_AUTHORITATIVE_INFORMATION).json({
      status: false,
      message: 'invalid credentials',
    });
  }

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    return res.status(StatusCodes.NON_AUTHORITATIVE_INFORMATION).json({
      status: false,
      message: 'Current Password you enter is incorrect',
    });
  }

  user.password = newPassword;
  const updatedUser = await user.save();
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 100),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  user = user.toObject();
  delete user.password;

  const token = createJWT({
    email: user.email,
    id: user._id,
  });
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'password updated',
    user,
    token,
  });
};

module.exports = {
  register,
  login,
  verifyUser,
  forgotPassword,
  resetPassword,
  changePassword,
};
