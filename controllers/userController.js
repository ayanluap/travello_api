import { User } from '../models/userModel.js';
import ApiFeatures from '../utils/ApiFeatures.js';
import { AppError, asyncHandler } from '../utils/ErrorHandler.js';

const filterObj = (obj, ...allowedFields) => {
  let newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

export const getAllUsers = asyncHandler(async (req, res, next) => {
  const features = new ApiFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const users = await features.query;

  res
    .status(200)
    .json({ status: 'success', results: users.length, data: { users } });
});

export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new AppError(`Can not found any User with ID : ${req.params.id}`, 404)
    );
  }

  res.status(201).json({
    status: 'success',
    data: { user },
  });
});

// It always good practice to have a getme controller where user can see his/her own data
export const getMe = asyncHandler(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

export const updateMe = asyncHandler(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        `You\'re using wrong route for updating password. Please, use /updatePassword route`,
        400
      )
    );

  // we should filter the body before updating otherwise user can change timestamp
  const filteredBody = filterObj(req.body, 'name', 'email');

  //Now we can use 'FindByIdAndUpdate' as we're not dealig with sensitive data
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
});

export const deleteMe = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({ status: 'success', data: null });
});

// Never update passwords with this!!!!
export const updateUser = asyncHandler(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    return next(
      new AppError(`Can not found any Tour with ID : ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  const deleteUser = await User.findByIdAndDelete(req.params.id);

  if (!deleteUser) {
    return next(
      new AppError(`Can not found any User with ID : ${req.params.id}`, 404)
    );
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
