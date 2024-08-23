const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const util = require("../lib/utils");

exports.log_in_post = [
  body("username")
    .trim()
    .isLength({ min: 4, max: 100 })
    .withMessage("Username length must be between 4 and 100")
    .isAlphanumeric()
    .withMessage("username can only contain alphanumeric characters")
    .escape(),
  body("password")
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage("password must be between 8 and 20 ")
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
    .withMessage(
      "Password should be combination of one uppercase , one lower case, one special char, one digit and min 8 , max 20 char long"
    )
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ success: false, user: req.body, errors: errors.array() });
    } else {
      try {
        const existingUser = await User.findOne({
          username: req.body.username,
        });
        if (!existingUser) {
          return res
            .status(401)
            .json({ success: false, message: "Incorrect Username" });
        }
        const match = await bcrypt.compare(
          req.body.password,
          existingUser.password
        );
        if (match) {
          const tokenObject = util.issueJWT(existingUser);
          console.log(tokenObject);
          req.user = existingUser;
          return res.status(200).json({
            success: true,
            user: existingUser,
            token: tokenObject.token,
            expiresIn: tokenObject.expires,
            message: "Logged in successfully",
          });
        } else {
          return res
            .status(401)
            .json({ success: false, message: "Incorrect Password" });
        }
      } catch (error) {
        console.log("This is from log in controller", error);
        const errorDetails = {
          message: error.message,
          stack: error.stack,
          name: error.name,
        };
        res
          .status(500)
          .json({
            success: false,
            message: "Log in failed try again later",
            errors: errorDetails.message,
          });
        next(error);
      }
    }
  }),
];
