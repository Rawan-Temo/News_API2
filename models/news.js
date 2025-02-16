const mongoose = require("mongoose");
const mongooseFuzzySearching = require("mongoose-fuzzy-searching");

// News Schema

const newsSchema = new mongoose.Schema(
  {
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
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
newsSchema.plugin(mongooseFuzzySearching, { fields: ["title", "description"] });
newsSchema.index({ category: 1, active: 1 });
const News = mongoose.model("News", newsSchema);
module.exports = News;
