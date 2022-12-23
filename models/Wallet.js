const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WalletSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  balance: { type: Number },
  withdrawals: [{ date: Date, amount: Number, approved: { type: Boolean, default: false } }],
});

const Wallet = mongoose.model('Wallet', WalletSchema);

module.exports = Wallet;
