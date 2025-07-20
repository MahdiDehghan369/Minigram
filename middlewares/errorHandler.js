const errorHandler = (err, req, res, next) => {
  console.log("❌ Error:", err.message);
  console.log(err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Something went wrong! 💥",
  });
};

module.exports = errorHandler;
