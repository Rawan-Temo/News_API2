const mongoose = require("mongoose");

// News Schema

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    publishedAt: {
      type: String,
      default: () => new Date().toISOString(), // Dynamically generates an ISO 8601 string
    },
    isTopNews: {
      type: Boolean,
      required: true,
      default: false,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    placeOfMedia: {
      type: String, // List of strings
      required: true,
    },
    photos: {
      type: [String], // List of image URLs
    },
    video: {
      type: String, // List of video URLs
    },
    views: {
      type: Number,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
const News = mongoose.model("News", newsSchema);
module.exports = News;
