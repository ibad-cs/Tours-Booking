const AppError = require('./../utils/appError');
const senderrordev = (err, req, res) => {
  //in development
  // console.log(err);
  // console.log(req);
  // console.log(res);
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statuscode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    console.log('ERROR!!!!: ', err);
    //rendered
    res.status(err.statuscode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
};
const senderrorprod = (err, req, res) => {
  //Productuib
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statuscode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      //Programming error dont leak details to client
      console.log('ERROR!!!!: ', err);
      return res.status(500).json({
        status: 'error',
        message: 'malfunction in mongoose or somewhere else',
      });
    }
  } else {
    //Rendered normal error
    if (err.isOperational) {
      console.log(err);
      return res.status(err.statuscode).render('error', {
        title: 'Something went wrong',
        msg: err.message,
      });
    }
    //Programming error dont leak details to client (unknown error )
    console.log('ERROR!!!!: ', err);
    return res.status(err.statuscode).render('error', {
      title: 'Something went wrong',
      msg: 'Please try again later',
    });
  }
};
const handleCastErrorDB = (err) => {
  const message = `invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data ${errors.join('.  ')}`;
  return new AppError(message, 400);
};
const handleDuplicateErrorDB = (err) => {
  const value = err.keyValue.name;
  console.log(value);
  const message = `Duplicate Data name ${value}`;
  return new AppError(message, 404);
};
const handleJWTError = (err) => {
  return new AppError('Invalid JWT token. Please log in again', 401);
};
const handleExpiredError = (err) => {
  return new AppError('Session has expired.Please log in again', 401);
};
module.exports = (err, req, res, next) => {
  err.statuscode = err.statuscode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV == 'development') {
    senderrordev(err, req, res);
  } else if (process.env.NODE_ENV == 'production') {
    let error = { ...err };
    error.message = err.message;
    console.log('EERORR', err.name);
    if (err.name == 'CastError') {
      error = handleCastErrorDB(error);
    } else if (err.code == 11000) {
      error = handleDuplicateErrorDB(err);
    } else if (err.name == 'ValidationError') {
      error = handleValidationErrorDB(err);
    } else if (err.name == 'JsonWebTokenError') {
      error = handleJWTError(err);
    } else if (err.name == 'TokenExpiredError') {
      error = handleExpiredError(err);
    }
    senderrorprod(error, req, res);
  }
};
