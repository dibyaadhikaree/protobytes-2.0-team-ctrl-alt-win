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
// const jobRouter = require("./routes/jobRoutes");
const authRouter = require("./routes/authRoute");
// const proposalRouter = require("./routes/proposalRoutes");
const errorController = require("./controllers/errorController");

app.use("/", indexRouter);
app.use("/auth", authRouter);
// app.use("/jobs", jobRouter);
// app.use("/proposals", proposalRouter);

//for catching all the errors
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "error",
    message: `No route found for ${req.url}`,
  });
});

app.use(errorController);

module.exports = app;
