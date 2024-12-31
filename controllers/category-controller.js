const asyncHandler = require("express-async-handler");
const Category = require("../models/category");
const Post = require("../models/post");

exports.allCategoriesGet = asyncHandler(async (req, res, next) => {
  try {
    const categories = await Category.find();
    if (categories.length === 0) {
      return res
        .status(404)
        .json({ successs: false, message: "Couldnt get categories" });
    }
    res.status(200).json({ success: true, categories: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "something went wrong." });
  }
});

exports.categoryGet = asyncHandler(async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, category: category });
  } catch (error) {
    res.status(500).json({ success: false, message: "something went wrong." });
  }
});

exports.categoryPostsGet = asyncHandler(async (req, res, next) => {
  try {
    const posts = await Post.find({
      categories: req.params.id,
      published: true,
    });
    if (!posts) {
      return res
        .status(404)
        .json({ success: false, message: "No posts found for this category" });
    }

    res.status(200).json({ success: true, posts });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong, please try again later",
    });
  }
});
