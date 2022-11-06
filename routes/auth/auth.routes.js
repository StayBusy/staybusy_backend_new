const express = require("express");
const authRouter = express.Router();

const { register, login } = require("./auth.controller");

authRouter.post("/register", register);
authRouter.post("/login", login);

module.exports = authRouter;
