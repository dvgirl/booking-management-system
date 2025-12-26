const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true
  },
  type: {
    type: String,
    enum: [
      "BOOKING_CONFIRMATION",
      "GUEST_INFO_FORM",
      "ENTRY_PASS",
      "PAYMENT_RECEIPT"
    ]
  },
  fileUrl: String,
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("Document", documentSchema);
