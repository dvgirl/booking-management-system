const mongoose = require("mongoose");

const processLogSchema = new mongoose.Schema({
    processId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProcessTracker"
    },

    action: String, // CREATED, ASSIGNED, UPDATED, CLOSED

    oldStatus: String,
    newStatus: String,

    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    remarks: String
}, { timestamps: true });

module.exports = mongoose.model("ProcessLog", processLogSchema);
