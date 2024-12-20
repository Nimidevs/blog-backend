const asyncHandler = require("express-async-handler");
const { body, validationResult, Result } = require("express-validator");
const Post = require("../models/post");
const Category = require("../models/category");
const {
  imageUploadFunction,
  imageUploadFunctionModifiedToUseBuffers,
} = require("../cloudinary.config");
const multer = require("multer");

const storage = multer.memoryStorage();

exports.allPostsGet = asyncHandler(async (req, res, next) => {
  try {
    const posts = await Post.find({ published: true }).exec();
    if (!posts) {
      return res
        .status(404)
        .json({ success: false, message: "No posts found" });
    }
    res.status(200).json({ success: true, posts: posts });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occured while fetching posts",
    });
  }
});

exports.postGet = asyncHandler(async (req, res, next) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
      published: true,
    });
    if (post) {
      // Update the visit count
      const updatedPost = await Post.findOneAndUpdate(
        { _id: post._id },
        { $inc: { visit_count: 1 }, $push: { viewTimeStamps: new Date() } },
        { new: true }
      );
      return res.status(200).json({ success: true, post: updatedPost });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Couldnt find post" });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching post" });
  }
});

exports.trendingPostsGet = asyncHandler(async (req, res, next) => {
  try {
    // Fetch trending posts, sorted by score in descending order and limit to top 10
    const trendingPosts = await Post.find({ published: true })
      .populate([
        { path: "author", select: "first_name last_name" },
        { path: "categories", select: "name" },
      ])
      .sort({ trending_score: -1 })
      .limit(10);

    // Check if any posts were found
    if (trendingPosts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No trending posts found.",
      });
    }

    // Respond with the trending posts
    res.status(200).json({
      success: true,
      posts: trendingPosts,
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error fetching trending posts:", error);

    // Respond with a generic error message
    res.status(500).json({
      success: false,
      message:
        "An error occurred while fetching trending posts. Please try again later.",
    });
  }
});

exports.searchPostsGet = asyncHandler(async (req, res, next) => {
  /**NOTE: There's still a lof of work to be done on this, not all the filters work e.g category it sees it as string at least thats what i think... mental note for when i get back to it */
  try {
    const { query, category, author, tags, fromDate, toDate } = req.query;

    // Initialize an empty filter object
    let filters = {};

    // Add filters conditionally based on user input
    if (query) {
      filters.$text = { $search: query }; // Assuming you've set up a text index for search
    }

    if (category) {
      filters.category = category;
    }

    if (author) {
      filters.author = author;
    }

    if (tags) {
      filters.tags = { $in: tags.split(",") }; // Split tags into an array
    }

    if (fromDate || toDate) {
      filters.date = {};
      if (fromDate) {
        filters.date.$gte = new Date(fromDate);
      }
      if (toDate) {
        filters.date.$lte = new Date(toDate);
      }
    }
    const posts = await Post.find(filters);
    if (!posts || posts.length < 1) {
      return res
        .status(404)
        .json({ success: false, message: "couldnt find post" });
    }
    res.status(200).json({ success: true, posts: posts });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong, try again later",
    });
  }
});

const ResultCache = new Map();
exports.RecentPostsGet = asyncHandler(async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    let pageNumber = Number(page);
    let pageLimit = Number(limit);

    let totalPublishedPosts = await Post.countDocuments({ published: true });
    let totalNumberOfPages = Math.ceil(totalPublishedPosts / pageLimit);

    if (pageNumber > totalNumberOfPages) {
      pageNumber = totalNumberOfPages;
    } else if (pageNumber < 1) {
      pageNumber = 1;
    }

    const cacheKey = `recent_posts_${pageNumber}_${pageLimit}`;

    if (ResultCache.has(cacheKey)) {
      return res.status(200).json({
        success: true,
        posts: ResultCache.get(cacheKey),
        pagination: {
          totalPosts: totalPublishedPosts,
          currentPage: pageNumber,
          totalPages: totalNumberOfPages,
          postsPerPage: pageLimit,
        },
        message: "cached response",
      });
    }
    // this paginates the result sending only pageLimit number of results each time sorted by the earliest, depending on the current page, it skips a number of  documents
    const posts = await Post.find({ published: true })
      .sort({ created_at: -1 })
      .skip((pageNumber - 1) * pageLimit)
      .limit(pageLimit)
      .populate([
        { path: "author", select: "first_name last_name" },
        { path: "categories", select: "name" },
      ]);

    if (!posts) {
      res.status(400).json({ success: false, message: "No posts found" });
    }
    ResultCache.set(cacheKey, posts);
    res.status(200).json({
      success: true,
      posts: posts,
      pagination: {
        totalPosts: totalPublishedPosts,
        currentPage: pageNumber,
        totalPages: totalNumberOfPages,
        postsPerPage: pageLimit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong Try again later",
    });
  }
});

exports.categoriesPostsGet = asyncHandler(async (req, res, next) => {
  try {
    const posts = await Post.find({
      published: true,
      categories: req.params.categoryName,
    }).exec();
    if (posts.length > 0) {
      res.status(200).json({ success: true, posts: posts });
    } else if (!posts || posts.length === 0) {
      res.status(404).json({
        success: false,
        message: "There are no posts in this category",
      });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching posts" });
  }
});

exports.editorsPicksGet = asyncHandler(async (req, res, next) => {
  try {
    const editorspicks = await Post.find({
      published: true,
      editors_pick: true,
    });
    if (editorspicks.length > 0) {
      res.status(200).json({ success: true, posts: editorspicks });
    } else if (!editorspicks || editorspicks.length === 0) {
      res.status(404).json({
        success: false,
        message: "There are no editorspicks",
      });
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching posts" });
  }
});

exports.featuredPostsGet = asyncHandler(async (req, res, next) => {
  try {
    const featuredPosts = await Post.find({
      published: true,
      featured: true,
    }).populate([
      { path: "author", select: "first_name last_name" },
      { path: "categories", select: "name" },
    ]);

    if (!featuredPosts) {
      return res.status(404).json({
        success: false,
        message: "There are no featuredPosts",
      });
    }
    res.status(200).json({ success: true, posts: featuredPosts });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching posts" });
    next(error);
  }
});

//Route to update likes count on the database
//increment route
exports.likesUpdatesPatch = asyncHandler(async (req, res, next) => {
  try {
    const updatedPost = await Post.findOneAndUpdate(
      { _id: req.params.id },
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!updatedPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    return res.status(200).json({ success: true, post: updatedPost });
  } catch (error) {
    res.status(500).json({ error: "An error occured while updating likes" });
    next(error);
  }
});

//decrement route
exports.unLikeUpdatesPatch = asyncHandler(async (req, res, next) => {
  try {
    const updatedPost = await Post.findOneAndUpdate(
      { _id: req.params.id },
      { $inc: { likes: -1 } },
      { new: true }
    );
    if (!updatedPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    return res.status(200).json({ success: true, post: updatedPost });
  } catch (error) {
    res.status(500).json({ error: "An error occured while updating likes" });
    next(error);
  }
});

// Routes Only available to authors/Writers

exports.createPostPost = [
  (req, res, next) => {
    console.log("first look at req: ", req.body);
    if (!Array.isArray(req.body.categories)) {
      req.body.categories =
        typeof req.body.categories === "undefined" ? [] : [req.body.categories];
    }
    next();
  },
  body("title").notEmpty().withMessage("Title is required").trim(), // Removed escape() validator from some as it was converting some characters to valid html to prevent xss attacks
  body("post").notEmpty().withMessage("Post is required").trim(),
  body("title_preview")
    .notEmpty()
    .withMessage("title preview is required")
    .trim()
    .escape(),
  body("subtitle_preview")
    .notEmpty()
    .withMessage("subtitle preview is required")
    .trim()
    .escape(),
  body("title_text")
    .notEmpty()
    .withMessage("title text is required")
    .trim()
    .escape(),
  body("post_text")
    .notEmpty()
    .withMessage("Post text is required")
    .trim()
    .escape(),
  body("image_preview")
    .optional() // Makes the field optional
    .isString()
    .withMessage("Image preview must be a string")
    .trim(),
  body("categories").isArray().withMessage("Categories must be an array"),
  body("categories.*").escape(),
  asyncHandler(async (req, res, next) => {
    console.log("second look at req: ", req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array() });
    }
    try {
      if (!req.user || !req.user._id) {
        console.log(req.user);
        return res.status(400).json({
          success: false,
          message: "User ID is required to create a post",
        });
      }
      const newPost = new Post({
        title: req.body.title,
        post: req.body.post,
        title_preview: req.body.title_preview,
        subtitle_preview: req.body.subtitle_preview,
        title_text: req.body.title_text,
        post_text: req.body.post_text,
        image_preview: req.body.image_preview || null,
        created_at: Date.now(),
        author: req.user._id,
        categories: req.body.categories,
        published: false,
        visit_count: 0,
        featured: false,
        editors_pick: false,
        likes: 0,
        updated_at: Date.now(),
      });

      await newPost.save();

      await Category.updateMany(
        { _id: { $in: req.body.categories } },
        { $inc: { usage_count: 1 } }
      );
      res.status(200).json({
        success: true,
        message: "Post created successfully",
        post: newPost,
        user: req.user,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "An error occured, try again later",
        error: error.message,
      });
    }
  }),
];

exports.deletePostDelete = asyncHandler(async (req, res, next) => {
  try {
    const postToDelete = await Post.findByIdAndDelete(req.params.id);
    if (!postToDelete) {
      return res
        .status(400)
        .json({ success: false, message: "Post not found" });
    }
    await Category.updateMany(
      { _id: { $in: postToDelete.categories } },
      { $inc: { usage_count: -1 } }
    );
    res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong Try again later",
    });
  }
});

exports.updatePostget = asyncHandler(async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res
        .status(404)
        .json({ success: false, messsage: "Couldn't find post" });
    }
    res.status(200).json({ success: true, post: post });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong, Try again later",
    });
  }
});

//some categories updates need to be made concerning this, what if a category is removed or one is added during the update, it has to reflect in the usage_count of the affected categories
exports.updatePostPost = [
  (req, res, next) => {
    if (!Array.isArray(req.body.categories)) {
      req.body.categories =
        typeof req.body.categories === "undefined" ? [] : [req.body.categories];
    }
    next();
  },

  body("title").notEmpty().withMessage("Title is required").trim(),
  body("post").notEmpty().withMessage("Post is required").trim(),
  body("title_preview")
    .notEmpty()
    .withMessage("title preview is required")
    .trim()
    .escape(),
  body("subtitle_preview")
    .notEmpty()
    .withMessage("subtitle preview is required")
    .trim()
    .escape(),
  body("title_text")
    .notEmpty()
    .withMessage("title text is required")
    .trim()
    .escape(),
  body("post_text")
    .notEmpty()
    .withMessage("Post text is required")
    .trim()
    .escape(),
  body("image_preview")
    .optional() // Makes the field optional
    .isString()
    .withMessage("Image preview must be a string")
    .trim(),
  body("categories").isArray().withMessage("Categories must be an array"),
  body("categories.*").escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array() });
    }
    try {
      const originalPost = await Post.findById(req.params.id);
      const updatedPost = await Post.findByIdAndUpdate(
        { _id: req.params.id },
        {
          $set: {
            title: req.body.title,
            post: req.body.post,
            title_preview: req.body.title_preview,
            subtitle_preview: req.body.subtitle_preview,
            title_text: req.body.title_text,
            post_text: req.body.post_text,
            image_preview: req.body.image_preview || null,
            categories: req.body.categories,
            updated_at: Date.now(),
          },
        },
        { new: true }
      );
      if (!updatedPost) {
        return res
          .status(400)
          .json({ suceess: false, message: "Post not found" });
      }
      const categoriesToAdd = updatedPost.categories.filter(
        (cat) => !originalPost.categories.includes(cat)
      );
      const categoriesToRemove = originalPost.categories.filter(
        (cat) => !updatedPost.categories.includes(cat)
      );
      if (categoriesToAdd.length > 0) {
        await Category.updateMany(
          { _id: { $in: categoriesToAdd } },
          { $inc: { usage_count: 1 } }
        );
      }

      // Update usage_count for removed categories
      if (categoriesToRemove.length > 0) {
        await Category.updateMany(
          { _id: { $in: categoriesToRemove } },
          { $inc: { usage_count: -1 } }
        );
      }
      res.status(200).json({
        success: true,
        message: " Post updated successfully",
        post: updatedPost,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Something went wrong Try again later",
      });
    }
  }),
];
exports.allAuthorsPostsGet = asyncHandler(async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.user._id });
    if (!posts) {
      res.status(404).json({ success: false, message: "No posts Found" });
    }
    res.status(200).json({ success: true, posts: posts });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong, Try again later",
    });
  }
});
exports.publishPostPatch = asyncHandler(async (req, res, next) => {
  try {
    const publishedPost = await Post.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          published: true,
        },
      },
      { new: true }
    );
    if (!publishedPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    res.status(200).json({
      success: true,
      message: "Post published successfully",
      post: publishedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "SOmething went wrong, Try again later",
    });
  }
});
exports.unPublishPostPatch = asyncHandler(async (req, res, next) => {
  try {
    const unPublishedPost = await Post.findByIdAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          published: false,
        },
      },
      { new: true }
    );
    if (!unPublishedPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }
    res.status(200).json({
      success: true,
      message: "Post unpublished successfully",
      post: unPublishedPost,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong, Try again later",
    });
  }
});

const upload = multer({ storage: storage });

exports.uploadImagesToCloudinary = [
  upload.single("image"),

  asyncHandler(async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const result = await imageUploadFunctionModifiedToUseBuffers(
        req.file.buffer
      );

      if (result.secure_url) {
        return res.status(200).json({
          status: 200,
          success: true,
          message: "image uploaded successfully",
          image_url: result.secure_url,
        });
      }
      return res.status(400).json({
        status: 400,
        success: false,
        message: result.message,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        status: 500,
        message: error.message,
      });
    }
  }),
];
