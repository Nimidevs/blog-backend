const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, required: true },
  post_text: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  categories: [{ type: String, required: true }],
  published: { type: Boolean, required: true },
  visit_count: { type: Number, required: true },
  featured: { type: Boolean, required: true },
  editors_pick: { type: Boolean, required: true },
  likes: { type: Number, default: 0, required: true },
  updated_at: { type: Date, default: Date.now },
});

PostSchema.index({ author: 1 });
PostSchema.index({ categories: 1 });
PostSchema.index({ published: 1 });
PostSchema.index({ featured: 1 });
PostSchema.index({ editors_pick: 1 });

module.exports = mongoose.model("Post", PostSchema);
