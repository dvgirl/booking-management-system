const mongoose = require("mongoose");

const scannedDocumentSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
    },

    reportDate: {
        type: Date,
        required: true
    },

    type: {
        type: String,
        enum: [
            "CHECKIN_REGISTER",
            "ID_SCAN",
            "PAYMENT_PROOF",
            "STAY_SUMMARY",
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

    locked: {
        type: Boolean,
        default: false
    },

    remarks: String
}, { timestamps: true });

module.exports = mongoose.model("ScannedDocument", scannedDocumentSchema);
