import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      trim: true,
      maxlength: [60, 'A tour name must have less or equal than 60 character'],
      minlength: [2, 'A tour name must have greater or equal to 2 character'],
    },
    rating: {
      type: Number,
      min: [1, 'Ratings must be between 1 to 5'],
      max: [5, 'Ratings must be between 1 to 5'],
      default: 5,
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
  }).populate({
    path: 'tour',
    select: 'name',
  });

  next();
});

export const Review = mongoose.model('Review', reviewSchema);
