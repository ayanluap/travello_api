import { Review } from '../models/reviewModel.js';
import ApiFeatures from '../utils/ApiFeatures.js';
import { AppError, asyncHandler } from '../utils/ErrorHandler.js';

export const getAllReviews = asyncHandler(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const features = new ApiFeatures(Review.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const reviews = await features.query;

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews },
  });
});

export const getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new AppError(`Can not found any Review with ID : ${req.params.id}`, 404)
    );
  }

  res.status(201).json({
    status: 'success',
    data: { review },
  });
});

export const createReviews = asyncHandler(async (req, res, next) => {
  // Allows nested route
  if (!req.body.tour) req.body.tour = req.params.tourId;
  // Remember User's info is stored in protet middleware we can take users id from there!!!
  if (!req.body.user) req.body.user = req.user.id;

  // Check if reviewed previously by this user on this particular tour
  // const alreadyReviewed = await Review.find({
  //   tour: req.body.tour,
  //   user: req.body.user,
  // });

  // if (alreadyReviewed)
  //   return next(new AppError(`You have Already reviewed this Tour`));

  const newReview = await Review.create(req.body);

  if (!newReview) {
    return next(new AppError(`Bad request sent on ID : ${req.params.id}`, 401));
  }

  res.status(201).json({
    status: 'success',
    data: { review: newReview },
  });
});

export const deleteReview = asyncHandler(async (req, res, next) => {
  const deleteReview = await Review.findByIdAndDelete(req.params.id);

  if (!deleteReview) {
    return next(
      new AppError(`Can not found any Review with ID : ${req.params.id}`, 404)
    );
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const updateReview = asyncHandler(async (req, res, next) => {
  const updatedReview = await Review.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedReview) {
    return next(
      new AppError(`Can not found any Review with ID : ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ status: 'success', data: { review: updatedReview } });
});
