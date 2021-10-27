import express from 'express';
import colors from 'colors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import tourRoutes from './routes/tourRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config({ path: './config.env' });

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json()); // can use custom middleware

app.use((req, res, next) => {
  console.log('Hello from the Middleware...'.cyan);
  next();
});

/*
app.get('/api/v1/tours', getAllTours);
app.post('/api/v1/tours', createTour);
app.get('/api/v1/tours/:id', getTour);
app.patch('/api/v1/tours/:id', updateTour);
app.delete('/api/v1/tours/:id', deleteTour); */

// OR (For cleaner code)

app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);

export default app;
