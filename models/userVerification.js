const mongoose = require("mongoose");

const userVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  verificationCode: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("UserVerification", userVerificationSchema);
