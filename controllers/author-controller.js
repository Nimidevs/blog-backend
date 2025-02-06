const asyncHandler = require("express-async-handler");

const User = require("../models/user");
const Post = require("../models/post");

exports.allAuthorsGet = asyncHandler(async (req, res, next) => {
  try {
    const authors = await User.find({ role: "writer" });
    if (!authors) {
      return res
        .status(404)
        .json({ success: false, message: "Couldnt get authors" });
    }
    res.status(200).json({ success: true, authors: authors });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong, Try again later",
    });
  }
});

exports.authorGet = asyncHandler(async (req, res, next) => {
  console.log('here')
  try {
    const { authorId } = req.params;

    // Fetch author and posts concurrently
    const [author, posts] = await Promise.all([
      User.findById(authorId),
      Post.find({ author: authorId, published: true }),
    ]);
    if (!author || !posts) {
      return res.status(404).json({
        success: false,
        message: `${
          !author ? "Could'nt find author" : !posts ? "Couldnt find posts" : ""
        }`,
      });
    }
    res.status(200).json({
      success: true,
      data: {
        author,
        posts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong, Try again later",
    });
  }
});

exports.topAuthorsGet = asyncHandler(async (req, res, next) => {
  console.log("here getting top authors");
  try {
    console.log("here like mad");
    const highestRead = await Post.find({ published: true })
      .populate([
        { path: "author", select: "first_name last_name" },
        { path: "categories", select: "name" },
      ])
      .sort({ visit_count: -1 })
      .limit(20);

    const topAuthors = highestRead.reduce((acc, post) => {
      const author = post.author;

      // Check if the author is already in the accumulator
      if (!acc.some((existingAuthor) => existingAuthor.id === author.id)) {
        acc.push(author);
      }

      return acc;
    }, []);
    res.status(200).json({ success: true, topAuthors });
  } catch {
    res.status(500).json({ success: false, message: "something went wrong" });
  }
});
