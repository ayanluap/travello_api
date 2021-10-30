import { Tour } from '../models/tourModel.js';
import ApiFeatures from '../utils/ApiFeatures.js';
import { AppError, asyncHandler } from '../utils/ErrorHandler.js';

// export const checkId = (req, res, next, val) => {
//   const id = tours.find((el) => el.id === val * 1);
//   if (!id) {
//     res.status(404).json({
//       status: 'fail',
//       message: 'invalid Id',
//     });
//   }

//   next();
// };
//

export const getTopTours = (req, res) => {
  req.query.sort = '-ratingsAverage,price';
  req.query.limit = '5';
  next();
};

export const getAllTours = asyncHandler(async (req, res, next) => {
  const features = new ApiFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

export const getTour = asyncHandler(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(
      new AppError(`Can not found any Tour with ID : ${req.params.id}`, 404)
    );
  }

  res.status(201).json({
    status: 'success',
    data: { tour },
  });
});

export const createTour = asyncHandler(async (req, res, next) => {
  // syntax 01 to create new Doc
  // const newTour=new Tour({});
  // newTour.save()

  // syntax 02 to create new Doc
  const newTour = await Tour.create(req.body);

  if (!newTour) {
    return next(new AppError(`Bad request sent on ID : ${req.params.id}`, 401));
  }

  res.status(201).json({
    status: 'success',
    data: { tour: newTour },
  });
});

export const updateTour = asyncHandler(async (req, res, next) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedTour) {
    return next(
      new AppError(`Can not found any Tour with ID : ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ status: 'success', data: { tour: updatedTour } });
});

export const deleteTour = asyncHandler(async (req, res, next) => {
  const deletedTour = await Tour.findByIdAndDelete(req.params.id);

  if (!deletedTour) {
    return next(
      new AppError(`Can not found any Tour with ID : ${req.params.id}`, 404)
    );
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const getTourStats = asyncHandler(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
  ]);

  res
    .status(200)
    .json({ status: 'success', result: stats.length, data: { stats } });
});

export const getMonthlyPlan = asyncHandler(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { numTourStarts: -1 },
    },
  ]);

  res
    .status(200)
    .json({ status: 'success', result: plan.length, data: { plan } });
});
