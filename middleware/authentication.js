const jwt = require("jsonwebtoken");
const User = require("../models/user");

const fs = require("fs");
const path = require("path");

const pathToKey = path.join(__dirname, "..", "id_rsa_pub.pem");
const PUB_KEY = fs.readFileSync(pathToKey, "utf8");
// console.log(PUB_KEY)

// const authenticate = async (req) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) throw new Error("No token provided");

//   const decoded = jwt.verify(token, PUB_KEY);
//   const user = await User.findById(decoded.sub);
//   if (!user) throw new Error("User not found");

//   return user;
// };

// exports.authenticateUser = async (req, res, next) => {
//   try {
//     req.user = await authenticate(req);
//     next();
//   } catch (err) {
//     res
//       .status(err.message === "No token provided" ? 401 : 404)
//       .json({ success: false, message: err.message });
//   }
// };

exports.authenticateUserAndVerifyRole = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== "writer") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(err.message === "No token provided" ? 401 : 404).json({
      success: false,
      message: err.message,
    });
  }
};
