const express = require("express");
const { body } = require("express-validator");
const authenticateUser = require("../../middlewares/authentication");

const { completeProfile,getMe, updateProfileBasic, updateTags } = require("./user.controller");

const userRouter = express.Router();

// const user = () => [
//   body("email").isEmail().withMessage("Invalid email"),
//   body("password").isLength({ min: 8 }).withMessage("password is too short!"),
// ];

userRouter.patch("/complete-profile", authenticateUser, completeProfile);
userRouter.get("/me", authenticateUser, getMe);
userRouter.patch("/basic", authenticateUser, updateProfileBasic);
userRouter.patch("/update-tag", authenticateUser, updateTags);

module.exports = userRouter;
