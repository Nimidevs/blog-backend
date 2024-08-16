var express = require("express");
var router = express.Router();
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const User = require("../models/user");

const authRoutes = require("./auth");
const passport = require("passport");

const pathToKey = path.join(__dirname, "..", "id_rsa_pub.pem");
const PUB_KEY = fs.readFileSync(pathToKey, "utf8");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json({ message: "Index Route" });
});
router.use("/auth", authRoutes);
router.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    // const extractorFunction = ExtractJwt.fromAuthHeaderAsBearerToken();
    // const token = extractorFunction(req);

    const token = req.headers.authorization.split(" ")[1]
    // console.log(token)
    if (token) {
      const decode = jwt.decode(token, PUB_KEY);
      const user = await User.findById({ _id: decode.sub });
      if (user) {
        return res.status(200).json({
          success: true,
          message: "User Authenticated successfully",
          user: user,
        });
      } else {
        return res.status(403).json({
          success: false,
          message: "Authentication Failed, Proceed to login",
          // user: user,
        });
      }
    } else {
      return res
        .status(403)
        .send({ success: false, msg: "No token provided." });
    }
  }
);

module.exports = router;
