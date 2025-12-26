const Transaction = require("../models/Transaction");

exports.initiateRefund = async (req, res) => {
    const {
        originalTransactionId,
        amount,
        paymentMode,
        transactionRef,
        isOffline,
        refundReason
    } = req.body;

    const originalTxn = await Transaction.findById(originalTransactionId);

    if (!originalTxn || originalTxn.status !== "VERIFIED") {
        return res.status(400).json({ message: "Invalid original transaction" });
    }

    const refundTxn = await Transaction.create({
        bookingId: originalTxn.bookingId,
        userId: originalTxn.userId,
        amount,
        paymentMode,
        transactionRef,
        transactionType: "REFUND",
        isRefund: true,
        refundOf: originalTransactionId,
        refundReason,
        isOffline,
        status: "PENDING"
    });

    res.json({
        message: "Refund initiated",
        refund: refundTxn
    });
};

exports.uploadRefundProof = async (req, res) => {
    const txn = await Transaction.findById(req.params.id);

    if (!txn || !txn.isRefund) {
        return res.status(404).json({ message: "Refund transaction not found" });
    }

    txn.proofUrl = req.file.path;
    txn.status = "SUCCESS";
    await txn.save();

    res.json({
        message: "Refund proof uploaded",
        refund: txn
    });
};

exports.verifyRefund = async (req, res) => {
    const txn = await Transaction.findByIdAndUpdate(
        req.params.id,
        {
            status: "VERIFIED",
            verifiedBy: req.user.id
        },
        { new: true }
    );

    res.json({
        message: "Refund verified",
        refund: txn
    });
};

exports.lockRefund = async (req, res) => {
    const txn = await Transaction.findById(req.params.id);

    if (txn.locked) {
        return res.status(400).json({ message: "Refund already locked" });
    }

    txn.locked = true;
    await txn.save();

    res.json({ message: "Refund locked permanently" });
};

