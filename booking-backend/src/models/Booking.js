const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room"
  },
  checkIn: Date,
  checkOut: Date,
  status: {
    type: String,
    enum: [
      "PENDING",
      "CONFIRMED",
      "CHECKED_IN",
      "CHECKED_OUT",
      "CANCELLED"
    ],
    default: "PENDING"
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: false // Set to false initially to prevent breaking existing records
  },
  city: { type: String },
  state: { type: String },
  bookingSource: {
    type: String,
    enum: ["ONLINE", "ADMIN", "CASH"],
    default: "ONLINE"
  },
  kycIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Kyc"
  }],
  checkInVerified: {
    type: Boolean,
    default: false
  },
  confirmationNumber: String,
  paymentStatus: {
    type: String,
    enum: ["UNPAID", "PAID", "PARTIAL"],
    default: "UNPAID"
  },
  totalAmount: Number,
  modificationHistory: [{
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    changes: Object,
    modifiedAt: Date
  }]

}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
