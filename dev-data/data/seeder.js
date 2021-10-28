import fs from 'fs';
import colors from 'colors';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });
import { Tour } from '../../models/tourModel.js';

const DB = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose
  .connect(DB)
  .then((res) =>
    console.log('DB connection established!'.yellow.bold.underline)
  )
  .catch((err) => console.log(`${err}`.red.bold.underline));

const __dirname = path.resolve();

const importData = async () => {
  try {
    const tours = JSON.parse(
      fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
    );
    await Tour.deleteMany();
    console.log('Previous data deleted...'.cyan);
    await Tour.create(tours);
    console.log('Data imported!'.green);
  } catch (err) {
    console.log('Can not import data : ', err);
  }
  process.exit(1);
};

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
