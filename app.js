var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
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
console.log(mongoDB);

require("./config/passport")(passport);

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

scheduledFunction();

app.use(cors());
// app.use(cors({
//   origin: 'http://localhost:3000',  // Your frontend URL
//   credentials: true  // Allow credentials (cookies)
// }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Credentials", true);
//   res.header("Access-Control-Allow-Origin", req.headers.origin);
//   res.header(
//     "Access-Control-Allow-Methods",
//     "GET,PUT,POST,PATCH,DELETE,UPDATE,OPTIONS"
//   );
//   res.header(
//     "Access-Control-Allow-Headers",
//     "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
//   );
//   next();
// });

app.use("/api", indexRouter);
// app.use("/users", usersRouter);

module.exports = app;
