const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WalletSchema = new Schema({
  userId: String,
  balance: Number,
});

const Wallet = mongoose.model("Wallet", WalletSchema);

module.exports = Wallet;
