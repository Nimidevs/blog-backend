const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReadSchema = new Schema({
  postId: mongoose.Schema.Types.ObjectId, // Reference to the Post
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Reads", ReadSchema);
