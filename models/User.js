const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: String,
  password: { type: String, select: false },
  verificationToken: String,
  isVerified: { type: Boolean, default: false },
  verified: Date,
  fullname: String,
  location: String,
  alternative_email: String,
  phone_number: String,
  country: String,
  prefered_currency: String,
  city: String,
  periodAvailable: String,
  image: { date: Buffer, mime: String },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password);
  return isMatch;
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
