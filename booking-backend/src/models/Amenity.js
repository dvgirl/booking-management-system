const mongoose = require("mongoose");

const amenitySchema = new mongoose.Schema({
  virtualAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VirtualAccount",
    required: true
  },
  name: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Amenity", amenitySchema);
