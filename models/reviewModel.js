import mongoose from 'mongoose';
import { Tour } from './tourModel.js';

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      trim: true,
      maxlength: [60, 'A tour name must have less or equal than 60 character'],
      minlength: [2, 'A tour name must have greater or equal to 2 character'],
      trim: true,
      required: [true, "review field can't be empty"],
    },
    rating: {
      type: Number,
      min: [1, 'Ratings must be between 1 to 5'],
      max: [5, 'Ratings must be between 1 to 5'],
      default: 5,
      required: [true, 'Please, give ratings between 1-5'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a Tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to an User'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    // When we do not have any property in DB but want to show in output In that case this is very handy
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Query middleware
reviewSchema.pre(/^find/, function (next) {
  //////NOTE -> Polpulating fields is ok for small arrays larger arrays may increace the time of the query/////
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  // It depends App to app to populate which field and which field not in our case we dont need this field to populate
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // });

  next();
});

// Declareing a static method
reviewSchema.statics.clacAvgRatings = async function (tourId) {
  // statics method help to call the aggregate function directly on the current document and returns a promise
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        numRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].avgRating,
    ratingsQuantity: stats[0].numRating,
  });
};

reviewSchema.post('save', function () {
  // this points to current review which is in uploading state.
  // At this point Review var. is not yet defined to prevent this declare a "this.constructor" above it where [this->current doc] & [constructor->current Model]

  // Review.clacAvgRatings(this.tour);  // Dont do this!!!!

  this.constructor.clacAvgRatings(this.tour);
});

export const Review = mongoose.model('Review', reviewSchema);
