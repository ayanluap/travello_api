import { Review } from '../models/reviewModel.js';
import ApiFeatures from '../utils/ApiFeatures.js';
import { AppError, asyncHandler } from '../utils/ErrorHandler.js';

export const getAllReviews = asyncHandler(async (req, res, next) => {
  const features = new ApiFeatures(Review.find(), req.query)
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

export const createReviews = asyncHandler(async (req, res, next) => {
  const newReview = await Review.create(req.body);

  if (!newReview) {
    return next(new AppError(`Bad request sent on ID : ${req.params.id}`, 401));
  }

  //   if(newReview) {

  //   }

  res.status(201).json({
    status: 'success',
    data: { review: newReview },
  });
});
