const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WalletSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  balance: { type: Number },
});

const Wallet = mongoose.model("Wallet", WalletSchema);

module.exports = Wallet;
