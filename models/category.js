const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  usage_count: {type: Number, default: 0,required: true,}
});

module.exports = mongoose.model("Category", CategorySchema);
