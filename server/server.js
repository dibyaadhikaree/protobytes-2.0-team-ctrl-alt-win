const app = require("./app");

const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

const port = process.env.PORT;

const DbUri = process.env.DB_URL;

const mongoose = require("mongoose");

mongoose
  .connect(DbUri)
  .then(() => console.log("Sucessfully connected to ChitoPay database"))
  .catch((error) => console.log("Error connecting to database", error));

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});
