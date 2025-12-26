const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["SELF", "SPOUSE", "CHILD"],
    required: true
  },
  fullName: String,
  aadhaarLast4: {
    type: String,
    required: true
  },
  documentUrl: {
    type: String,
    required: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User" // or "Admin"
  },
  verifiedAt: Date,
  kycStatus: {
    type: String,
    enum: ["NOT_REQUIRED", "PENDING", "VERIFIED"],
    default: "PENDING"
  },
  isOffline: {
    type: Boolean,
    default: false
  },
  offlineNote: String
}, { timestamps: true });

module.exports = mongoose.model("Kyc", kycSchema);
