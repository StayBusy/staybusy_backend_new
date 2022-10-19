const express = require("express");
const { find } = require("../models/User");
const router = express.Router();

//mongodb user model
const User = require("../models/User");

//mongodb user verify model
const UserVerify = require("../models/UserVerify");

// email account
const nodemailer = require("nodemailer");

//unique string
const { v4: uuidv4 } = require("uuid");

// env variables
require("dotenv").config();

//password hashing
const bcrypt = require("bcrypt");

//path for verify
const path = require("path");
//nodemailer
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.AUTH_EMAIL,
    clientId: process.env.AUTH_CLIENT_ID,
    clientSecret: process.env.AUTH_CLIENT_SECRET,
    refreshToken: process.env.AUTH_REFRESH_TOKEN,
  },
});

//TESTING SUCCESS
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("ready for messages");
  }
});

//Signup

router.post("/signup", (req, res) => {
  let { email, password } = req.body;
  email = email.trim();
  password = password.trim();

  if (email == "" || password == "") {
    res.json({
      status: "Failed",
      message: "Empty input fields!",
    });
  } else if (!/^[\w~\.]+@([\w~\.])+[\w~]{2,4}$/.test(email)) {
    res.json({
      status: "Failed",
      message: "Invalid email address!",
    });
  } else if (password.length < 8) {
    res.json({
      status: "Failed",
      message: "password is too short!",
    });
  } else {
    //check if user exist
    User.find({ email })
      .then((result) => {
        if (result.length) {
          //user already exists
          res.json({
            status: "Failed",
            message: "User with email already exist!",
          });
        } else {
          //create user in db

          // password hashing
          const saltRounds = 10;
          bcrypt
            .hash(password, saltRounds)
            .then((hashedPassword) => {
              const newUser = new User({
                email,
                password: hashedPassword,
                isVerified: false,
              });
              newUser
                .save()
                .then((result) => {
                  //verify email
                  sendVerifyEmail(result, res);
                  //   res.json({
                  //     status: "Success",
                  //     message: "Signup was successful",
                  //     data: result,
                  //   });
                })
                .catch((err) => {
                  res.json({
                    status: "Failed",
                    message: "An error occured while saving user",
                  });
                });
            })
            .catch((err) => {
              res.json({
                status: "Failed",
                message: "An error occured at password section",
              });
            });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: "Failed",
          message: "An error occured while checking for existing user!",
        });
      });
  }
});

//send verify email
const sendVerifyEmail = ({ _id, email }, res) => {
  //url used for the mail
  const currentUrl = "http://localhost:3005/";

  const uniqueString = uuidv4() + _id;

  // mail options
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Verify your email",
    html: `<p>Verify your email address so you can complete the signup process</p><p>This link will expires in 12 hours </p> <p>click <a href=${
      currentUrl + "user/verify/" + _id + "/" + uniqueString
    }>here</a> to continue</p>`,
  };
  //hash the uniqueString
  const saltRounds = 10;
  bcrypt
    .hash(uniqueString, saltRounds)
    .then((hashedUniqueString) => {
      const newVerify = new UserVerify({
        userId: _id,
        uniqueString: hashedUniqueString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 43200000,
      });
      newVerify
        .save()
        .then(() => {
          transporter
            .sendMail(mailOptions)
            .then(() => {
              //sent email
              res.json({
                status: "Pending",
                message: "verification email Sent",
              });
            })
            .catch((error) => {
              res.json({
                status: "Failed",
                message: "verification email failed try again",
              });
            });
        })
        .catch((error) => {
          res.json({
            status: "Failed",
            message: "Error trying to save verification email data try again",
          });
        });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        status: "Failed",
        message: "An error occured while hashing email details!",
      });
    });
};
//verify email route
router.get("/verify/:userId/:uniqueString", (req, res) => {
  let { userId, uniqueString } = req.params;

  UserVerify.find({ userId })
    .then((result) => {
      if (result.length > 0) {
        //verify record exist
        const { expiresAt } = result[0];
        const hashedUniqueString = result[0].uniqueString;
        if (expiresAt < Date.now()) {
          UserVerify.deleteOne({ userId })
            .then((result) => {
              User.deleteOne({ _if: userId })
                .then(() => {
                  "verification link has expired!. please sign up again";
                  res.redirect(`/user/verifred/error=true&message=${message}`);
                })
                .catch((error) => {
                  let message =
                    "An error occured while deleting user with unique string!";
                  res.redirect(`/user/verifred/error=true&message=${message}`);
                });
            })
            .catch((error) => {
              let message =
                "An error occured while checking for deleting expired user verification record";
              res.redirect(`/user/verifred/error=true&message=${message}`);
            });
        } else {
          //user record is still valid
          //first check the hashed is unique string

          bcrypt
            .compare(uniqueString, hashedUniqueString)
            .then((result) => {
              if (result) {
                User.updateOne({ _id: userId }, { isVerified: true })
                  .then(() => {
                    UserVerify.deleteOne({ userId })
                      .then(() => {
                        res.sendFile(
                          path.join(__dirname, "./../views/verified.html")
                        );
                      })
                      .catch((err) => {
                        let message;
                        ("An error occured while finalizing successfull verification");
                        res.redirect(
                          `/user/verifred/error=true&message=${message}`
                        );
                      });
                  })
                  .catch((err) => {
                    let message =
                      "An error occured while updating user record to show verificatin";
                    res.redirect(
                      `/user/verifred/error=true&message=${message}`
                    );
                  });
              } else {
                res.json({
                  status:
                    "Invalid verification details passed. cross check inbox ",
                  message: "Invalid password entered!",
                });
              }
            })
            .catch((err) => {
              let message =
                "An error occured while checking for unique strings";
              res.redirect(`/user/verifred/error=true&message=${message}`);
            });
        }
      } else {
        //verify record does not exist
        let message =
          "Account record doesn't match any record or has been verified already. please sign up or log in";
        res.redirect(`/user/verifred/error=true&message=${message}`);
      }
    })
    .catch((error) => {
      console.log(error);
      let message =
        "An error occured while checking for existing user verification record";
      res.redirect(`/user/verifred/error=true&message=${message}`);
    });
});

//verified page route
router.get("verified", (req, res) => {
  res.sendFile(path.join(__dirname, "./../views/verifred.html"));
});
//Login

router.post("/login", (req, res) => {
  let { email, password } = req.body;
  email = email.trim();
  password = password.trim();

  if (email == "" || password == "") {
    res.json({
      status: "Failed",
      message: "Empty input fields!",
    });
  } else {
    //Check if user exist in db
    User.find({ email })
      .then((data) => {
        //user exist
        if (data.length) {
          //is verified?
          if (!data[0].verified) {
            res.json({
              status: "Failed",
              message:
                "Email hasn't been verified yet Check your inbox for the verification link",
              data: data,
            });
          } else {
            const hashedPassword = data[0].password;
            bcrypt
              .compare(password, hashedPassword)
              .then((result) => {
                if (result) {
                  res.json({
                    status: "Success",
                    message: "Login successful",
                    data: data,
                  });
                } else {
                  res.json({
                    status: "Failed",
                    message: "Invalid password entered!",
                  });
                }
              })
              .catch((err) => {
                res.json({
                  status: "Failed",
                  message: "An error occured while comparing passwords!",
                });
              });
          }
        } else {
          res.json({
            status: "Failed",
            message: "Invalid Credentials!",
          });
        }
      })
      .catch((err) => {
        res.json({
          status: "Failed",
          message: "An error occured while checking for exixting user!",
        });
      });
  }
});

module.exports = router;
