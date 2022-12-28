const express = require('express');
const { body } = require('express-validator');
const authenticateUser = require('../../middlewares/authentication');

const {
  completeProfile,
  getMe,
  updateProfileBasic,
  updateTags,
  updateProfileImage,
  addAccount,
  getSetting,
  withdraw,
} = require('./user.controller');

const userRouter = express.Router();

// const user = () => [
//   body("email").isEmail().withMessage("Invalid email"),
//   body("password").isLength({ min: 8 }).withMessage("password is too short!"),
// ];

userRouter.patch('/complete-profile', authenticateUser, completeProfile);
userRouter.get('/me', authenticateUser, getMe);
userRouter.get('/setting', authenticateUser, getSetting);
userRouter.patch('/basic', authenticateUser, updateProfileBasic);
userRouter.patch('/add-account', authenticateUser, addAccount);
userRouter.patch('/update-tag', authenticateUser, updateTags);
userRouter.patch('/change-profile-image', authenticateUser, updateProfileImage);
userRouter.post('/withdraw', authenticateUser, withdraw);

module.exports = userRouter;
