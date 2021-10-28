import mongoose from 'mongoose';

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Tour must have a name!'],
      unique: true,
      trim: true,
    },
    slug: String,
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
    },
    ratingsAverage: { type: Number, default: 0 },
    ratingsQuantity: { type: Number, default: 0 },
    price: { type: Number, required: [true, 'Price should not be empty!'] },
    priceDiscount: { type: Number },
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
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Document middleware mongoose [pre and post]
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Query middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

// Aggregation middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

// Model middleware (Not so important )

export const Tour = mongoose.model('Tour', tourSchema);
