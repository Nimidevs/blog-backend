const express = require("express");
const router = express.Router();
const passport = require("passport");

const application_controller = require("../controllers/application_controller");

router.post(
  "/authors",
  passport.authenticate("jwt", { session: false }),
  application_controller.authorsApplicationPost
);

module.exports = router;
