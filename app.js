var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require('cors')
const scheduledFunction = require("./lib/scheduled");

const indexRouter = require("./routes");
// var usersRouter = require("./routes/users");

const passport = require("passport");
const mongoose = require("mongoose");
require("dotenv").config();

var app = express();

//Initialize the Database using the mongoDB ODM Mongoose
mongoose.set("strictQuery", false);
const mongoDB = process.env.DATABASE_URL;

require("./config/passport")(passport);

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

scheduledFunction();

app.use(cors())
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", indexRouter);
// app.use("/users", usersRouter);

module.exports = app;
