import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // Inbuilt node module

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User must have a name!'],
    trim: true,
    maxlength: [40, 'A tour name must have less or equal than 40 character'],
    minlength: [2, 'A tour name must have greater or equal to 2 character'],
  },
  email: {
    type: String,
    required: [true, 'Email is required!'],
    trim: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please, provide a valid Email!'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    minLength: [8, 'Password should contain atleast 8 letters'],
    required: [true, 'Please enter a password to proceed!'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Re-enter your password!'],
    validate: {
      // works on .save() or .create() not on .update()
      validator: function (val) {
        return this.password === val;
      },
      message: 'Password and Confirm password seems to be unique!',
    },
  },
  role: {
    type: String,
    default: 'user',
    enum: {
      values: ['admin', 'user', 'guide'],
      message: 'Role should either: Admin, User or Guide!',
    },
  },
  passwordChangedAt: { type: Date },
  passwordResetToken: { type: String },
  passwordResetTokenExpiresIn: { type: Date },
  active: { type: Boolean, default: true, select: false },
});

userSchema.pre(/^find/, function (next) {
  // points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// Best place to encrypt users password is at the moment we recieve it from them

userSchema.pre('save', async function (next) {
  // only run this func if password is modified
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

// when we declare methods this would available for all document associated with this schema
userSchema.methods.verifyPassword = async (
  originalPassword,
  enteredPassword
) => {
  return await bcrypt.compare(enteredPassword, originalPassword);
};

userSchema.methods.passwordChangedAfter = function (timestamp) {
  if (this.passwordChangedAt) {
    const prevTime = this.passwordChangedAt.getTime() / 1000;
    return prevTime > timestamp; // False if pass not updated
  }
};

userSchema.methods.createPasswordResetToken = async function () {
  const token = crypto.randomBytes(32).toString('hex');
  // const encryptedToken = await bcrypt.hash(token, 12);
  const encryptedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.passwordResetToken = encryptedToken;
  this.passwordResetTokenExpiresIn = Date.now() + 10 * 60 * 1000;
  this.save({ validateBeforeSave: false });

  return token;
};

export const User = mongoose.model('User', userSchema);
