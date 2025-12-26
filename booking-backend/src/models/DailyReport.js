const mongoose = require("mongoose");

const dailyReportSchema = new mongoose.Schema({
  date: {
    type: Date,
    unique: true
  },

  bookings: {
    total: Number,
    confirmed: Number,
    cancelled: Number
  },

  checkInOut: {
    checkedIn: Number,
    checkedOut: Number
  },

  occupancy: {
    totalRooms: Number,
    occupiedRooms: Number
  },

  revenue: {
    total: Number,
    cash: Number,
    upi: Number,
    razorpay: Number,
    bank: Number
  },

  pendingPayments: Number,

  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("DailyReport", dailyReportSchema);
