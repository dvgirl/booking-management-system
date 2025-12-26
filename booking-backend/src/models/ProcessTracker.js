const mongoose = require("mongoose");

const processTrackerSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
    },

    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room"
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    processType: {
        type: String,
        enum: [
            "CALL",
            "FACILITY",
            "CANCELLATION",
            "SUPPORT",
            "HOUSEKEEPING",
            "MAINTENANCE",
            "OTHER"
        ],
        required: true
    },

    title: {
        type: String,
        required: true
    },

    description: String,

    priority: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
        default: "MEDIUM"
    },

    status: {
        type: String,
        enum: [
            "OPEN",
            "ASSIGNED",
            "IN_PROGRESS",
            "RESOLVED",
            "CLOSED"
        ],
        default: "OPEN"
    },

    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    closedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    isOffline: {
        type: Boolean,
        default: false
    },

    resolutionNote: String
}, { timestamps: true });

module.exports = mongoose.model("ProcessTracker", processTrackerSchema);
