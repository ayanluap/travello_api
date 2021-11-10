import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/userModel.js';
import { AppError, asyncHandler } from '../utils/ErrorHandler.js';
import { sendEmail } from '../utils/Email.js';

const getJwtToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
////////////////////////////////////////////////////////////////////////////////
export const signUp = asyncHandler(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role,
    passwordChangedAt: Date.now(),
  });

  const token = getJwtToken(newUser._id);
  if (!newUser) return next(new AppError('Error while signing up!', 400));

  res.status(201).json({ status: 'success', token, data: { user: newUser } });
});

////////////////////////////////////////////////////////////////////////////////
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('Email & Password both are required!', 400));

  const user = await User.findOne({ email }).select('+password');
  const enteredPassword = password;
  if (!user || !(await user.verifyPassword(user.password, enteredPassword)))
    return next(new AppError('Wrong email or password', 401));

  const token = getJwtToken(user._id);
  res.status(200).json({ status: 'success', token, user });
});

////////////////////////////////////////////////////////////////////////////////
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next(new AppError('Please, login to continue!', 401));

  // Decode/Verify the token and found the ID
  const verified = await jwt.verify(token, process.env.JWT_SECRET);

  // Is user still exist after login
  const user = await User.findById(verified.id);
  if (!user)
    return next(
      new AppError('User belonging to this token no longer exist!', 401)
    );

  // is user changed the password after token was issued?
  const isPassChanged = user.passwordChangedAfter(verified.iat);
  if (isPassChanged)
    return next(
      new AppError(
        'User has recently changed the password! Please login again!',
        401
      )
    );

  req.user = user;
  next();
});

////////////////////////////////////////////////////////////////////////////////
export const accessTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError(`You don\'t have permission to perform this action!`, 403)
      );
    next();
  };
};

////////////////////////////////////////////////////////////////////////////////
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(
      new AppError(`User with email: ${req.body.email} doesn\'t exist!`, 403)
    );

  const resetToken = await user.createPasswordResetToken();

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const sub = 'Password Reset Token for Travello (Valid for 10 min.)';
  const msg = `Your password reset token fron Travello is : \n${resetUrl}\nIf you did not request for it then please ignore!`;

  try {
    await sendEmail({
      email: user.email,
      subject: sub,
      text: msg,
    });

    res.status(200).json({
      status: 'success',
      message: `Reset token is sent to ${user.email}!`,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresIn = undefined;
    user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error occur while sending the mail. Please, try again later!',
        500
      )
    );
  }
});

////////////////////////////////////////////////////////////////////////////////
export const resetPassword = asyncHandler(async (req, res, next) => {
  // get user based on token
  // const encryptedTokenToCompare = await bcrypt.hash(req.params.token, 12);
  const encryptedTokenToCompare = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex'); // creates same encyption string if done twice unlike BCRYPT
  console.log({ encryptComp2: encryptedTokenToCompare });
  const user = await User.findOne({
    passwordResetToken: encryptedTokenToCompare,
    passwordResetTokenExpiresIn: { $gt: Date.now() },
  });
  if (!user)
    return next(new AppError('Token has expired. Please try again!', 403));

  // If user then token is valid, Can update the password now
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresIn = undefined;
  await user.save();

  const token = getJwtToken(user._id);

  res
    .status(200)
    .json({ status: 'success', token, message: 'Password updated!' });
});

////////////////////////////////////////////////////////////////////////////////
export const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  // check for the user
  const user = await User.findById(req.user._id).select('+password');

  // check if posted current password is correct
  if (!currentPassword)
    return next(new AppError('Enter your current password to proceed!', 403));
  if (!(await user.verifyPassword(user.password, currentPassword)))
    return next(new AppError("You've entered wrong password!", 403));

  // update password
  user.password = newPassword;
  user.passwordConfirm = confirmNewPassword;
  await user.save();

  // send token
  const token = getJwtToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
    message: 'Congrats! Your has been updated!',
  });
});
