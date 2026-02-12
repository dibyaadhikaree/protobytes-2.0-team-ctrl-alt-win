module.exports = (err, req, res, next) => {
  console.error("ERROR 💥", err);

  let statusCode = err.statusCode || 500;
  let status = err.status || "error";
  let message = err.message || "Something went wrong";

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    status = "fail";
    const field = Object.keys(err.keyValue)[0];
    message = `${
      field.charAt(0).toUpperCase() + field.slice(1)
    } already exists. Please use a different ${field}.`;
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    status = "fail";
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  res.status(statusCode).send({
    status,
    message: message,
  });
};
