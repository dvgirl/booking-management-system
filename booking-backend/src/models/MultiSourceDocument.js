const mongoose = require("mongoose");

const multiSourceDocSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking"
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  source: {
    type: String,
    enum: [
      "ONLINE_USER",
      "ONLINE_SYSTEM",
      "OFFLINE_SCAN",
      "ADMIN_UPLOAD",
      "AUTO_GENERATED"
    ],
    required: true
  },

  documentType: {
    type: String,
    enum: [
      "KYC",
      "BOOKING_CONFIRMATION",
      "ENTRY_PASS",
      "PAYMENT_PROOF",
      "ID_SCAN",
      "CHECKIN_REGISTER",
      "STAY_SUMMARY",
      "REPORT",
      "OTHER"
    ],
    required: true
  },

  fileUrl: {
    type: String,
    required: true
  },

  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  uploadedAt: {
    type: Date,
    default: Date.now
  },

  verificationStatus: {
    type: String,
    enum: ["NOT_REQUIRED", "PENDING", "VERIFIED", "REJECTED"],
    default: "NOT_REQUIRED"
  },

  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  locked: {
    type: Boolean,
    default: false
  },

  isOffline: {
    type: Boolean,
    default: false
  },

  syncStatus: {
    type: String,
    enum: ["SYNCED", "PENDING"],
    default: "SYNCED"
  },

  remarks: String
}, { timestamps: true });

module.exports = mongoose.model("MultiSourceDocument", multiSourceDocSchema);
