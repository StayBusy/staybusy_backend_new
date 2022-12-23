const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstname: {
    type: String,
    maxlength: 100,
    trim: true,
    lowercase: true,
  },
  lastname: {
    type: String,
    maxlength: 100,
    trim: true,
    lowercase: true,
  },
  middlename: {
    type: String,
    minlength: 2,
    maxlength: 100,
    trim: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: [true, 'email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, select: false },
  verificationToken: { type: String, select: false },
  isVerified: { type: Boolean, default: false },
  verified: Date,
  location: String,
  alternative_email: String,
  phone_number: String,
  country: String,
  prefered_currency: String,
  city: String,
  period_available: String,
  tags: { type: Array, default: [] },
  accountDetail: [
    {
      country: String,
      bankName: String,
      bankAccountNumber: String,
      bankAccountName: String,
      sortCode: String,
      date: Date,
    },
  ],
  completed: { type: Boolean, default: false },
  taskTaken: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  completedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  declinedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  image: String,
  passwordToken: { type: String },
  passwordTokenExpirationDate: { type: Date },
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
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

const User = mongoose.model('User', UserSchema);

module.exports = User;
