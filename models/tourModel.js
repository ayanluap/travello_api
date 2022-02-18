import mongoose from 'mongoose';
import slugify from 'slugify';
import { AppError } from '../utils/ErrorHandler.js';
import { User } from './userModel.js';

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Tour must have a name!'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 character'],
      minlength: [2, 'A tour name must have greater or equal to 2 character'],
      // validate: [validator.isAlpha, 'Tour name must contain letters only!'],
    },
    duration: {
      type: Number,
      required: [true, 'A Tour must have a duration!'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour must have a Group size!'],
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour must have a Difficulty!'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: Easy, Medium or Difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [1, 'Ratings must be between 1 to 5'],
      max: [5, 'Ratings must be between 1 to 5'],
    },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'Price should not be empty!'] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount should be less than Price!',
      },
    },
    summary: { type: String, trim: true },
    description: {
      type: String,
      trim: true,
      required: [true, 'A Tour must have a Description!'],
    },
    imageCover: {
      type: String,
      required: [true, 'A Tour must have a cover image!'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: { type: Boolean, default: false },
    startLocation: {
      type: {
        type: String,
        default: 'Point', // other options can be of any shapes/ polygons etc.
        enum: ['Point'],
      },
      coordinates: [Number],
      description: String,
      address: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        description: String,
        address: String,
        day: Number,
      },
    ],
    // guides: [{ type: Array }], Embedding (Denormalised form) This need to import the referenced Document (User model) to import
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        // Referencing (Normalised form) This need doesnt need to import referenced Document
        // Also called Child Referencing
        ref: 'User', 
      },
    ],
  },
  // When we do not have any property in DB but want to show in output In that case this is very handy
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// In order to retrieve data of the users after referecing we need to populate the data so that instead of returning us only the ID of the user it returns the referenced object. We'll add polpulate query in the TOUR CONTROLLER!!!

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('slug').get(function () {
  return slugify(this.name, { lower: true });
});

// Document middleware mongoose [work on .save() & .create() not on .update()]

// Embedding (Denormalisation)
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id)); //res var will be full of promises
//   this.guides = await Promise.all(guidesPromises).catch((err) =>
//     next(new AppError('Enter a valid user Id', 400))
//   );
//   next();
// });

// Query middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// Aggregation middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

// Model middleware (Not so important )

export const Tour = mongoose.model('Tour', tourSchema);
