import mongoose from 'mongoose';
import app from './app.js';

const DB = process.env.DB.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose
  .connect(DB)
  .then((con) => console.log('DB successfully connected!'.cyan))
  .catch((err) => console.log(`${err}`.red.underline));

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(
    `App is running in ${process.env.NODE_ENV} mode on port : ${PORT}`.yellow
      .bold.underline
  );
});
