const User = require("../../models/User");
const { v4: uuidv4 } = require('uuid');
const {
  BadRequestError,
  UnauthenticatedError,
  NotFoundError,
} = require("../../errors");
const { StatusCodes } = require("http-status-codes");
const path = require("path");

const completeProfile = async (req, res) => {
  const { _id } = req.user;
  const tags = req.body.tags.split(",")

  if(tags.length > 4) {
    throw new BadRequestError("You can only choose 4 categories");
  }

  if (req.files === null) {
    throw new BadRequestError("Please upload your image");
  }

  const userImage = req.files.image;
  if (!userImage.mimetype.includes("image")) {
    throw new BadRequestError("Please upload a valid image");
  }

  // max upload is 2 megabytes
  const maxSize = 2000000;

  if (userImage.size > maxSize) {
    throw new BadRequestError("Exceeded allowed image max size");
  }


  let imageId = `${uuidv4()}-${req.body.firstname}`

  const imagePath = path.join(
    __dirname,
    "../../uploads/" +  `${imageId}-${userImage.name}`
  );

  const userVerified = await User.findById(_id);

  if (userVerified == null) {
    throw new NotFoundError(`User with id ${_id}, not found`);
  }

  // To be sure that user has verified it's email
  if (userVerified.isVerified !== true) {
    throw new UnauthenticatedError("You have not verified your email");
  }

  await userImage.mv(imagePath);

  req.body.completed = true;
  req.body.image = `uploads/${imageId}-${userImage.name}`;
  req.body.tags = tags;


  const user = await User.findByIdAndUpdate(userVerified._id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(StatusCodes.OK).json({
    status: true,
    message: "Profile completed",
    user,
  });
};

const getMe = (req, res) => {
  res.status(StatusCodes.OK).json({
    status: true,
    message: "User data",
    user: req.user,
  });
};

module.exports = { completeProfile, getMe };
