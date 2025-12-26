const mongoose = require("mongoose");

const bookingChangeHistorySchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reason: String,
    changes: Object, // before/after snapshot
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "BookingChangeHistory",
  bookingChangeHistorySchema
);
