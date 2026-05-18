const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  if (process.env.NODE_ENV !== 'test') {
    console.error(error);
  }

  res.status(statusCode).json({
    message: statusCode === 500 ? 'Something went wrong.' : error.message,
    details: process.env.NODE_ENV === 'production' ? undefined : error.message
  });
};

module.exports = errorHandler;
