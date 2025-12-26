const mongoose = require("mongoose");

const facilityBlockSchema = new mongoose.Schema({
  virtualAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "VirtualAccount"
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room"
  },
  reason: String,
  fromDate: Date,
  toDate: Date
}, { timestamps: true });

module.exports = mongoose.model("FacilityBlock", facilityBlockSchema);
