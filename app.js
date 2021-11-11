import express from 'express';
import colors from 'colors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';

import tourRoutes from './routes/tourRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { AppError, globalErrorHandler } from './utils/ErrorHandler.js';

dotenv.config({ path: './config.env' });

const app = express();

// some imoprtant headers for security using helmet
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 500,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, Try again in an hour!',
});
app.use('/api', limiter);
app.use(express.json({ limit: '100kb' })); // can use custom middleware
app.use(cookieParser);

// Data sanitization against NOSQL query injection
app.use(ExpressMongoSanitize());
// Data sanitization against XSS
app.use(xss());
// HTTP parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

/*
app.get('/api/v1/tours', getAllTours);
app.post('/api/v1/tours', createTour);
app.get('/api/v1/tours/:id', getTour);
app.patch('/api/v1/tours/:id', updateTour);
app.delete('/api/v1/tours/:id', deleteTour); */

// OR (For cleaner code)
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);

app.all('*', (req, res, next) => {
  next(
    new AppError(`Route ${req.originalUrl} is not found on this server!`, 404)
  );
});

app.use(globalErrorHandler);

export default app;
