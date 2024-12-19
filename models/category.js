const mongoose = require("mongoose");

// Category Schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true, // Converts the string to lowercase
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
categorySchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);
const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
