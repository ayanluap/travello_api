import fs from 'fs';
import colors from 'colors';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });
import { Tour } from '../../models/tourModel.js';
import { User } from '../../models/userModel.js';
import { Review } from '../../models/reviewModel.js';

const DB = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose
  .connect(DB)
  .then((res) =>
    console.log('DB connection established!'.yellow.bold.underline)
  )
  .catch((err) => console.log(`${err}`.red.bold.underline));

const __dirname = path.resolve();

// Import data to DB
const importData = async () => {
  try {
    const tours = JSON.parse(
      fs.readFileSync(`${__dirname}/dev-data/data/tours.json`, 'utf-8')
    );
    const users = JSON.parse(
      fs.readFileSync(`${__dirname}/dev-data/data/users.json`, 'utf-8')
    );
    const reviews = JSON.parse(
      fs.readFileSync(`${__dirname}/dev-data/data/reviews.json`, 'utf-8')
    );

    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Previous data deleted...'.cyan);

    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews, { validateBeforeSave: false });
    console.log('Data imported!'.green);
  } catch (err) {
    console.log('Can not import data : ', err);
  }
  process.exit(1);
};

// Delete previous data from DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data deleted!'.green);
  } catch (err) {
    console.log('Something went wrong : ', err);
  }
  process.exit(1);
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
  console.log('Invalid argv!'.red.bold);
  process.exit(1);
}
