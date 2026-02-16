var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

var app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//Setting Up the Routers
const indexRouter = require("./routes/indexRoute");
const authRouter = require("./routes/authRoute");
const walletRouter = require("./routes/walletRoute");
const offlineRouter = require("./routes/offlineRoute");
const errorController = require("./controllers/errorController");

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/wallet", walletRouter);
app.use("/offline", offlineRouter);

//for catching all the errors
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "error",
    message: `No route found for ${req.url}`,
  });
});

app.use(errorController);

module.exports = app;
