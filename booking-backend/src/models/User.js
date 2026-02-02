const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String
  },
  phone: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  role: {
    type: String,
    enum: ["USER", "ADMIN", "SUPER_ADMIN"],
    default: "USER"
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  virtualAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VirtualAccount"
  },
  googleId: {
    type: String,
    index: true,
    unique: true, // Recommended to prevent duplicate accounts
    sparse: true
  },
  profilePic: {
    type: String
  },
  authProvider: {
    type: String,
    enum: ["OTP", "GOOGLE"],
    default: "OTP"
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    default: null
  }, // Crucial for Admins

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);