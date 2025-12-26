const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: Number,
      required: true,
      unique: true
    },
    type: {
      type: String,
      default: "Standard"
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    amenities: [String],
    isBlocked: {
      type: Boolean,
      default: false
    },
    allowedRoles: [{
      type: String,
      enum: ["USER", "ADMIN", "SUPER_ADMIN"],
      default: ["USER", "ADMIN", "SUPER_ADMIN"]
    }],
    description: String,
    capacity: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 🔥 Virtual for booking count
roomSchema.virtual("bookingsCount", {
  ref: "Booking",
  localField: "_id",
  foreignField: "roomId",
  count: true
});

module.exports = mongoose.model("Room", roomSchema);
