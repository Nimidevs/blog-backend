const asyncHandler = require("express-async-handler");
const Application = require("../models/applications");
const { body, validationResult, Result } = require("express-validator");
const {
  imageUploadFunctionModifiedToUseBuffers,
} = require("../cloudinary.config");
const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

const handleImageUpload = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: "Author's image not uploaded" });
  }
  try {
    const result = await imageUploadFunctionModifiedToUseBuffers(
      req.file.buffer
    );
    if (result.secure_url) {
      req.body.author_imageUrl = result.secure_url;
      next();
    } else {
      return res.status(400).json({
        status: 400,
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 500,
      message: error.message,
    });
  }
};

exports.authorsApplicationPost = [
  upload.single("image"),
  handleImageUpload,
  body("applicationreason")
    .trim()
    .isLength({ min: 4, max: 1000 })
    .withMessage("application reason length must be between 4 and 1000")
    .escape(),
  body("bio")
    .trim()
    .isLength({ min: 4, max: 800 })
    .withMessage("Username length must be between 4 and 800")
    .escape(),
  body("email").trim().isEmail().withMessage("email must be a valid email"),
  body("facebook")
    .trim()
    .isURL()
    .withMessage("facebook url is not a valid url"),
  body("linkedin")
    .trim()
    .isURL()
    .withMessage("linkedin url is not a valid url"),
  body("instagram")
    .trim()
    .isURL()
    .withMessage("instagram url is not a valid url"),
  body("twitter").trim().isURL().withMessage("twitter url is not a valid url"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Application failed",
        error: errors.array(),
      });
    }
    try {
      const exsitingApplication = await Application.findOne({
        user_id: req.user._id,
      });
      if (exsitingApplication) {
        return res.status(400).json({
          success: false,
          message: "This user already submitted an application",
        });
      }
      const newApplication = new Application({
        user_id: req.user._id,
        application_reasons: req.body.applicationreason,
        email: req.body.email,
        bio: req.body.bio,
        status: "pending",
        submitted_at: Date.now(),
        socialMedia: {
          twitter: req.body.twitter,
          facebook: req.body.facebook,
          instagram: req.body.instagram,
          linkedin: req.body.linkedin,
        },
        profile_image: req.body.author_imageUrl,
      });
      await newApplication.save();

      res.status(200).json({
        success: true,
        message: "Application submitted successfully",
        applicationId: newApplication._id,
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "An error occured, try again later" });
    }
  }),
];
