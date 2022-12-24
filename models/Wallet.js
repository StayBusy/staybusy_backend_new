const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WalletSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  balance: { type: Number },
  processing: { type: Boolean, default: false },
  withdrawals: [{ date: Date, amount: Number, bankDetail: String, approved: { type: Boolean, default: false } }],
});

const Wallet = mongoose.model('Wallet', WalletSchema);

module.exports = Wallet;
