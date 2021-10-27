import mongoose from 'mongoose';

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A Tour must have a name!'],
    unique: [true, 'Tour with this name is already present!'],
  },
  rating: { type: Number, default: 0 },
  price: { type: Number, required: [true, 'Price should not ne empty!'] },
});

export const Tour = mongoose.model('Tour', tourSchema);
