const Post = require("../models/post");
const cron = require("node-cron");

async function updateTrendingScoresInBatches(batchSize = 100) {
  let skip = 0;
  let posts;

  try {
    do {
      posts = await Post.find({ published: true })
        .sort({ _id: 1 }) // Sorting to ensure consistent pagination
        .skip(skip)
        .limit(batchSize);

      if (posts.length === 0) {
        // If no posts are returned, log and break the loop
        console.log("No more posts to process.");
        break;
      }

      for (const post of posts) {
        await post.calculateTrendingScore(24);
      }

      skip += batchSize;
    } while (posts.length > 0);
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error updating trending scores:", error);
  }
}


const scheduleTrendingScoreUpdates = () => {
  cron.schedule("0 */12 * * *", async () => {
    console.log("Running scheduled job to update trending scores.");
    try {
      await updateTrendingScoresInBatches();
    } catch (error) {
      console.error("Error during scheduled trending score update:", error);
    }
  });
};

module.exports = scheduleTrendingScoreUpdates;
