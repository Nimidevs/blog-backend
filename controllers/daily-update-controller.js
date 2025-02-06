const getStartAndEndOfDay = require("../lib/getToday");
const expressAsyncHandler = require("express-async-handler");
const Post = require("../models/post");
const Reads = require("../models/read");

exports.getTodaysUpdates = expressAsyncHandler(async (req, res, next) => {
  const { startOfDay, endOfDay } = getStartAndEndOfDay();
  try {
    const [noTodaysPosts, blogReads] = await Promise.all([
      Post.countDocuments({
        created_at: { $gte: startOfDay, $lt: endOfDay },
      }),
      Reads.countDocuments({
        created_at: { $gte: startOfDay, $lt: endOfDay },
      }),
    ]);
    res
      .status(200)
      .json({ success: true, newPostsCount: noTodaysPosts, blogReads });
  } catch (error) {
    res.status(500).json({ success: false, message: "An error occured" });
  }
});
