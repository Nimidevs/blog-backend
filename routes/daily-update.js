const express = require("express");
const router = express.Router();

const daily_update_controller = require("../controllers/daily-update-controller");

router.get("/", daily_update_controller.getTodaysUpdates);

module.exports = router