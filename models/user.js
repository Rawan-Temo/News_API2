const { request } = require("express");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      unique: true, // Assuming email should be unique
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Assuming email should be unique
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true, // Assuming phone is a required field
      unique: true, // Assuming phone should be unique
      trim: true, // Optional, for removing extra spaces
    },
    role: {
      type: String,
      enum: ["admin", "user"], // Assuming phone is a required field
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Create a model based on the schema

userSchema.pre("save", function (next) {
  // 'this' refers to the document being saved
  if (this.role === "admin") {
    this.isVerified = true;
  }
  next();
});
const User = mongoose.model("User", userSchema);

module.exports = User;
