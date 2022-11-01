const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: String,
  password: String,
  isVerified: Boolean,
  fullname: String,
  location: String,
  alternative_email: String,
  phone_number: String,
  country: String,
  prefered_currency: String,
  city: String,
  periodAvailable: String,
  image: {
    date: Buffer,
    mime: String,
  },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
