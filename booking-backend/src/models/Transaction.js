const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    amount: {
        type: Number,
        required: true
    },

    direction: {
        type: String,
        enum: ["IN", "OUT"], // IN = Payment, OUT = Refund
        required: true
    },

    paymentMode: {
        type: String,
        enum: [
            "CASH",
            "UPI",
            "BANK_TRANSFER",
            "CARD",
            "RAZORPAY",
            "OTHER",
            "CASHFREE"
        ],
        required: true
    },

    transactionRef: String,

    proofUrl: String,

    status: {
        type: String,
        enum: ["PENDING", "SUCCESS", "VERIFIED", "FAILED"],
        default: "PENDING"
    },

    isOffline: {
        type: Boolean,
        default: false
    },

    refundOf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction"
    },

    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    locked: {
        type: Boolean,
        default: false
    },

    remarks: String
}, { timestamps: true });

module.exports = mongoose.model("Transaction", transactionSchema);
