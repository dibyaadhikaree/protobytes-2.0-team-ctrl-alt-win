var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.send({
    status: "success",
    message: "Welcome  to Chito Pay Api ",
  });
});

module.exports = router;
