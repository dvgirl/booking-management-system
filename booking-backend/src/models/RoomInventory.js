const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room"
  },
  date: {
    type: Date
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking"
  }
}, { timestamps: true });

inventorySchema.index({ roomId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("RoomInventory", inventorySchema);
