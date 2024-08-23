const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, required: true },
  post_text: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  categories: [
    { type: Schema.Types.ObjectId, ref: "Category", required: true },
  ],
  published: { type: Boolean, required: true },
  visit_count: { type: Number, required: true },
  featured: { type: Boolean, required: true },
  editors_pick: { type: Boolean, required: true },
  likes: { type: Number, default: 0, required: true },
  viewTimeStamps: [{ type: Date, required: true }],
  trending_score: { type: Number, default: 0, required: true },
  updated_at: { type: Date, default: Date.now },
});

PostSchema.index({ title: "text", post_text: "text" });
PostSchema.index({ author: 1 });
PostSchema.index({ categories: 1 });
PostSchema.index({ viewTimeStamps: 1 });
PostSchema.index({ visit_count: 1 });
PostSchema.index({ trending_score: 1 });
PostSchema.index({ published: 1 });
PostSchema.index({ featured: 1 });


//Chat gpt helped.. Barely know whats going on here
PostSchema.methods.calculateTrendingScore = async function (timeframeInHours) {
  const now = Date.now(); // Current timestamp in milliseconds
  const lambda = 0.001; // Decay rate for view timestamps
  let decayedViews = 0;
  
  // Calculate the cutoff time based on the provided timeframe
  const cutoffTime = now - timeframeInHours * 1000 * 60 * 60; // Timeframe in milliseconds

  // Aggregate views within the specified timeframe, applying decay to each view
  this.viewTimeStamps.forEach((timestamp) => {
    if (timestamp >= cutoffTime) { // Only consider timestamps within the timeframe
      const timeDifference = (now - timestamp) / (1000 * 60 * 60); // Convert difference to hours
      decayedViews += Math.exp(-lambda * timeDifference); // Apply exponential decay to views
    }
  });

  // Normalize the score: ensure a score between 0 and 1
  // Calculate the maximum possible decayed views for normalization
  const maxPossibleViews = timeframeInHours; // Assuming a post could receive 1 view per hour as a rough estimate
  const maxPossibleScore = this.visit_count + maxPossibleViews;

  // Avoid division by zero and ensure the score is within the range [0, 1]
  const normalizedScore = (this.visit_count + decayedViews) / maxPossibleScore;

  // Update the trending score in the schema
  this.trending_score = Math.min(normalizedScore, 1); // Ensure the score doesn't exceed 1

  // Optionally, save the updated trending score
  await this.save();

  return this; // Return the updated post instance
};
// PostSchema.index({ editors_pick: 1 });

module.exports = mongoose.model("Post", PostSchema);
