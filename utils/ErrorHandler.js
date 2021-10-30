export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; //to identify weather the err is operational or programming error

    Error.captureStackTrace(this, this.constructor); //on which line/file error is coming
  }
}

export const asyncHandler = (fn) => {
  return (req, res, next) => fn(req, res, next).catch(next);
};

///////////////////////////// CUSTOM ERR HANDLE ////////////////////////////////
const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Error handling for production---> CastError, MongoServerError, ValidationError
const handleCastErrorDB = (err) => {
  const msg = `Invalid ${err.path}: ${err.value}`;
  return new AppError(msg, 400);
};
const handleMongoServerErrorDB = (err) => {
  const msg = `Duplicate field value : ${err.keyValue.name}`;
  return new AppError(msg, 400);
};
const handleValidationErrorDB = (err) => {
  const allErr = Object.values(err.errors).map((el) => el.message);
  const msg = `Invalid input : ${allErr.join('. ')}`;
  return new AppError(msg, 400);
};

const sendErrProd = (err, res) => {
  if (err.isOperational) {
    res
      .status(err.statusCode)
      .json({ status: err.status, message: err.message });
  } else {
    res.status(500).json({ status: 'error', message: 'Something went wrong!' });
  }
};

export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') sendErrDev(err, res);
  else if (process.env.NODE_ENV === 'production') {
    let customError = { ...err };
    if (err.name === 'CastError') customError = handleCastErrorDB(customError);
    if (err.code === 11000) customError = handleMongoServerErrorDB(customError);
    if (err.name === 'ValidationError')
      customError = handleValidationErrorDB(customError);

    sendErrProd(customError, res);
  }

  next();
};
