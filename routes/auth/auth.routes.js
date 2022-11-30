const express = require("express");
const { body, check, validationResult } = require("express-validator");

const authRouter = express.Router();
const {
  register,
  login,
  verifyUser,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("./auth.controller");
const authenticateUser = require("../../middlewares/authentication");


const auth = () => [
  body("email").isEmail().withMessage("Invalid email"),
  body("password").isLength({ min: 8 }).withMessage("password is too short!"),
];

authRouter.post("/register", auth(), register);
authRouter.post("/login", login);
authRouter.post("/verify-user/:token/:email", verifyUser);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.patch("/change-password",authenticateUser, changePassword);

module.exports = authRouter;
