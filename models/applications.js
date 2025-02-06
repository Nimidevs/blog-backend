const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ApplicationSchema = new Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  application_reasons: { type: String, required: true },
  email: { type: String, required: true },
  bio: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  submitted_at: { type: Date, default: Date.now },
  socialMedia: {
    type: Map,
    of: String,
  },
  profile_image: { type: String },
});

module.exports = mongoose.model("Application", ApplicationSchema);
