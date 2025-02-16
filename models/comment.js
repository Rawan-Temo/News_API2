const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    newsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "News",
      required: true,
    }, // Reference to news article
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Reference to user
    text: {
      type: String,
      required: true,
    }, // Comment text
    likes: {
      type: Number,
      default: 0,
    }, // Like count
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", commentSchema);
