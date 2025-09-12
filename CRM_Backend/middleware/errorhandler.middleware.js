// errorMiddleware.js
const globalErrorHandler = (err, req, res, next) => {
  console.error("GLOBAL ERROR:", err); // for debugging

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default globalErrorHandler;