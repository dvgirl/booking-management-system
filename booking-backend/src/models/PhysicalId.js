const mongoose = require("mongoose");

const physicalIdSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required: true
    },

    guestName: String,

    idType: {
        type: String,
        enum: ["AADHAAR", "PASSPORT", "DRIVING_LICENSE", "VOTER_ID"]
    },

    idLast4: String,

    collectedAt: {
        type: Date,
        default: Date.now
    },

    collectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    lockerNumber: String,

    status: {
        type: String,
        enum: ["COLLECTED", "RETURNED", "LOST"],
        default: "COLLECTED"
    },

    returnedAt: Date,
    returnedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    remarks: String
}, { timestamps: true });

module.exports = mongoose.model("PhysicalId", physicalIdSchema);
