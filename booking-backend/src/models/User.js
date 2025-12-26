const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String
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
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
