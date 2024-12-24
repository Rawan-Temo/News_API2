const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    newsId: {
      type: mongoose.Schema.Types.ObjectId, // References the News model
      ref: "News", // Name of the related collection (News)
      required: true,
    },
    src: {
      type: String, // Path or URL to the image
      required: true,
    },
  },
  { timestamps: true }
); // Add createdAt and updatedAt timestamps automatically

// Export the model
imageSchema.index({ newsId: 1, src: 1 });
const Image = mongoose.model("Image", imageSchema);
module.exports = Image;
