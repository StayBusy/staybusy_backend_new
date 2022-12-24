const User = require('../../models/User');
const { v4: uuidv4 } = require('uuid');
const { BadRequestError, UnauthenticatedError, NotFoundError } = require('../../errors');
const { StatusCodes } = require('http-status-codes');
const path = require('path');
const Wallet = require('../../models/Wallet');
const Submission = require('../../models/Submission');
const { default: mongoose } = require('mongoose');
const { send } = require('process');
const sendEmailToAdmin = require('../../utils/sendEmailToAdmin');

const completeProfile = async (req, res) => {
  console.log(req.body);
  const { _id } = req.user;
  const tags = req.body.tags.split(',');

  if (tags.length > 4) {
    throw new BadRequestError('You can only choose 4 categories');
  }

  if (req.files === null) {
    throw new BadRequestError('Please upload your image');
  }

  const userImage = req.files.image;
  if (!userImage.mimetype.includes('image')) {
    throw new BadRequestError('Please upload a valid image');
  }

  // max upload is 2 megabytes
  const maxSize = 2000000;

  if (userImage.size > maxSize) {
    throw new BadRequestError('Exceeded allowed image max size');
  }

  let imageId = `${uuidv4()}-${req.body.firstname}`;

  const imagePath = path.join(__dirname, '../../uploads/' + `${imageId}-${userImage.name}`);

  const userVerified = await User.findById(_id);

  if (userVerified == null) {
    throw new NotFoundError(`User with id ${_id}, not found`);
  }

  // To be sure that user has verified it's email
  if (userVerified.isVerified !== true) {
    throw new UnauthenticatedError('You have not verified your email');
  }

  await userImage.mv(imagePath);

  req.body.completed = true;
  req.body.image = `uploads/${imageId}-${userImage.name}`;
  req.body.tags = tags;

  const user = await User.findByIdAndUpdate(userVerified._id, req.body, {
    new: true,
    runValidators: true,
  });
  await Wallet.create({ userId: user._id, balance: 0 });

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Profile completed',
    user,
  });
};

const getMe = async (req, res) => {
  const { _id } = req.user;

  const wallet = await Wallet.findOne({ userId: _id });
  // const submission = await Submission.find({
  //   userId: _id,
  //   status: "completed",
  // });

  const submission = await Submission.aggregate([
    {
      $match: {
        status: 'completed',
        submittedBy: mongoose.Types.ObjectId(_id),
      },
    },
    { $group: { _id: null, price: { $sum: '$price' } } },
  ]);

  let user = await User.findOne({ _id }).populate('taskTaken').populate('completedTasks');
  if (user === null) {
    throw new UnauthenticatedError('User not found');
  }

  let userWallet;
  console.log(96, wallet);

  if (wallet !== null) {
    wallet.balance = submission[0]?.price.toFixed(2);
    userWallet = await wallet.save();
  }

  user = user.toObject();
  user.wallet = userWallet?.balance;

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'User data',
    user,
  });
};

const updateProfileBasic = async (req, res) => {
  const { email, firstname, lastname, phone_number } = req.body;

  const userObj = {};
  if (email) {
    const isEmailExist = await User.findOne({ email });
    console.log(isEmailExist);
    if (email === isEmailExist.email) {
      userObj.email = email;
    } else if (isEmailExist) {
      throw new BadRequestError('Email is not avaliable');
    } else {
      userObj.email = email;
    }
  }
  if (firstname) {
    userObj.firstname = firstname;
  }
  if (lastname) {
    userObj.lastname = lastname;
  }
  if (phone_number) {
    userObj.phone_number = phone_number;
  }

  const user = await User.findByIdAndUpdate(req.user._id, userObj, {
    new: true,
    runValidators: true,
  });

  if (user === null) {
    throw new UnauthenticatedError('User not found');
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Updated',
    user,
  });
};

const updateTags = async (req, res) => {
  let { tags } = req.body;
  tags = tags.split(',');
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { tags },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Updated',
    user: tags,
  });
};

const updateProfileImage = async (req, res) => {
  const { _id } = req.user;

  if (req.files === null) {
    throw new BadRequestError('Please upload image');
  }

  const userImage = req.files.image;
  if (!userImage.mimetype.includes('image')) {
    throw new BadRequestError('Please upload a valid image');
  }

  // max upload is 2 megabytes
  const maxSize = 2000000;

  if (userImage.size > maxSize) {
    throw new BadRequestError('Exceeded allowed image max size');
  }

  let imageId = `${uuidv4()}-${req.body.firstname}`;

  const imagePath = path.join(__dirname, '../../uploads/' + `${imageId}-${userImage.name}`);

  await userImage.mv(imagePath);

  req.body.image = `uploads/${imageId}-${userImage.name}`;

  const user = await User.findByIdAndUpdate(_id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'uploaded',
    user,
  });
};

const addAccount = async (req, res) => {
  const { country, bankName, bankAccountNumber, bankAccountName, sortCode } = req.body;
  if (!country || !bankName || !bankAccountName || !bankAccountNumber || !sortCode) {
    throw new BadRequestError('All fields required');
  }

  const user = await User.findById(req.user._id).select('country accountDetail');
  // const isAccountExists = user.accountDetail.find(
  //   (acc) => acc.bankAccountNumber === bankAccountNumber
  // );
  // if (isAccountExists) {
  //   throw new BadRequestError("Account number exists");
  // }
  let date = new Date();
  user.accountDetail = [
    // ...user.accountDetail,
    { country, bankName, bankAccountNumber, bankAccountName, sortCode, date },
  ];

  const updatedUser = await user.save();

  res.status(StatusCodes.CREATED).json({
    status: true,
    message: 'Account detail added',
    accountDetail: updatedUser,
  });
};

const getSetting = async (req, res) => {
  res.status(StatusCodes.OK).json({
    status: true,
    message: 'setting',
  });
};

const withdraw = async (req, res) => {
  const { _id } = req.user;
  const amount = parseFloat(req.body.amount);
  const bankDetail = req.body.bankDetail;
  if (!amount || !bankDetail) {
    throw new BadRequestError('Amount and Bank detail required');
  }
  // const _id = '63a0c33e9bc6777fd77d2961';

  const date = new Date();
  const wallet = await Wallet.findOne({ userId: _id });

  // console.log(wallet.balance);

  if (amount > wallet.balance) {
    throw new BadRequestError('You cannot withdraw more than your balance');
  }

  if (wallet.processing) {
    throw new BadRequestError('You still have pending payment');
  }

  wallet.withdrawals.push({ amount, date, bankDetail });
  wallet.processing = true;

  const userWallet = await wallet.save();

  let user = await User.findOne({ _id });

  sendEmailToAdmin({ amount, name: `${user.firstname} ${user.lastname}`, id: _id });

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'Successful, Waiting for approval',
  });
};

module.exports = {
  completeProfile,
  getMe,
  updateProfileBasic,
  updateTags,
  updateProfileImage,
  addAccount,
  getSetting,
  withdraw,
};
