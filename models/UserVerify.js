const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserVerifySchema = new Schema({
  userId: String,
  verificationToken: String,
  createdAt: Date,
  expiresAt: Date,
});

const UserVerify = mongoose.model('UserVerify', UserVerifySchema);

module.exports = UserVerify;
