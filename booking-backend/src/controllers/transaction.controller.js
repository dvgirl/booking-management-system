
const Booking = require("../models/Booking");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const axios = require('axios')
const CF_URL = "https://sandbox.cashfree.com/pg/orders";
const CF_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CF_SECRET_KEY = process.env.CASHFREE_CLIENT_SECRET;

exports.initiateBookingWithPayment = async (req, res) => {
    try {
        const { roomId, checkIn, checkOut, amount, payment_method } = req.body;

        const user = await User.findById(req.user.id).select("name phone email username");
        if (!user || !user.phone) {
            return res.status(400).json({ message: "User phone number is required for payment." });
        }

        const customerName = user.name || user.username || "Guest User";
        const email = user.email || "guest@example.com";
        const phone = user.phone;

        const payMethod = payment_method === "cod" ? "COD" : "ONLINE";

        // 1️⃣ Create booking in PENDING state
        const booking = await Booking.create({
            roomId,
            userId: req.user.id,
            checkIn,
            checkOut,
            status: "PENDING",
            paymentStatus: "UNPAID",
            totalAmount: amount
        });

        let orderId = ""

        let cf_token = null;

        // 2️⃣ Create Cashfree order if online payment
        if (payMethod === "ONLINE") {
            const CF_URL = "https://sandbox.cashfree.com/pg/orders";

            const cashfreeResponse = await axios.post(
                CF_URL,
                {
                    order_id: String(orderId),
                    order_amount: amount,
                    order_currency: "INR",
                    customer_details: {
                        customer_id: String(req.user.id), // Unique ID for the customer
                        customer_name: customerName,
                        customer_email: email,
                        customer_phone: phone,
                    },
                    order_meta: {
                        // Optional: where to send the user after payment if not using modal
                        return_url: "http://3.7.252.110:5000/payment-verify?order_id={order_id}"
                    }
                },
                {
                    headers: {
                        "x-client-id": CF_CLIENT_ID,
                        "x-client-secret": CF_SECRET_KEY,
                        "x-api-version": "2023-08-01", // Required for v3
                        "Content-Type": "application/json",
                    },
                }
            );

            cf_token = cashfreeResponse.data.payment_session_id;
            orderId = cashfreeResponse.data.order_id;
        }

        // 3️⃣ Save transaction
        await Transaction.create({
            bookingId: booking._id,
            userId: req.user.id,
            amount,
            direction: "IN",
            paymentMode: "CASHFREE",
            transactionRef: orderId,
            status: "PENDING"
        });

        res.json({
            status: 200,
            msg: "Booking initiated successfully",
            bookingId: booking._id,
            payment_method: payMethod,
            amount,
            order_id: orderId,
            cf_token
        });

    } catch (err) {
        console.error("Initiate Payment Error:", err.response?.data || err);
        res.status(500).json({ message: "Payment initiation failed", error: err.response?.data || err.message });
    }
};
exports.verifyCashfreePayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        const CF_URL = `https://sandbox.cashfree.com/pg/orders/${orderId}`;

        const response = await axios.get(CF_URL, {
            headers: {
                "x-client-id": process.env.CASHFREE_CLIENT_ID,
                "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
                "x-api-version": "2023-08-01",
            }
        });

        const cfOrder = response.data;

        // 2. Find internal transaction
        const transaction = await Transaction.findOne({ transactionRef: orderId });
        if (!transaction) return res.status(404).json({ message: "Transaction record missing" });

        // 3. Determine status updates
        let transactionStatus = "PENDING";
        let bookingStatus = "PENDING";
        let paymentStatus = "UNPAID";

        if (cfOrder.order_status === "PAID") {
            transactionStatus = "SUCCESS";
            bookingStatus = "CONFIRMED";
            paymentStatus = "PAID";
        } else if (cfOrder.order_status === "EXPIRED" || cfOrder.order_status === "TERMINATED") {
            transactionStatus = "FAILED";
            bookingStatus = "CANCELLED"; // Or keep PENDING if you allow retry
        }

        // 4. Update Database
        // We use findByIdAndUpdate to ensure we have the latest bookingId from the transaction
        await Transaction.findByIdAndUpdate(transaction._id, { status: transactionStatus });
        await Booking.findByIdAndUpdate(transaction.bookingId, {
            status: bookingStatus,
            paymentStatus: paymentStatus
        });

        res.json({
            status: 200,
            paymentStatus: transactionStatus,
            cfStatus: cfOrder.order_status
        });

    } catch (err) {
        console.error("Verification Error:", err.response?.data || err.message);
        res.status(500).json({ message: "Verification failed" });
    }
};
exports.createTransaction = async (req, res) => {
    const {
        bookingId,
        amount,
        paymentMode,
        transactionType,
        transactionRef,
        isOffline,
        remarks
    } = req.body;

    const txn = await Transaction.create({
        bookingId,
        userId: req.user.id,
        amount,
        paymentMode,
        transactionType,
        transactionRef,
        isOffline,
        remarks,
        status: isOffline ? "PENDING" : "SUCCESS"
    });

    res.json({
        message: "Transaction created",
        transaction: txn
    });
};

exports.uploadProof = async (req, res) => {
    const txn = await Transaction.findById(req.params.id);

    txn.proofUrl = req.file.path;
    txn.status = "SUCCESS";
    await txn.save();

    res.json(txn);
};

exports.verifyTransaction = async (req, res) => {
    const txn = await Transaction.findByIdAndUpdate(
        req.params.id,
        {
            status: "VERIFIED",
            verifiedBy: req.user.id
        },
        { new: true }
    );

    res.json(txn);
};

exports.lockTransaction = async (req, res) => {
    const txn = await Transaction.findById(req.params.id);

    if (txn.locked) {
        return res.status(400).json({ message: "Already locked" });
    }

    txn.locked = true;
    await txn.save();

    res.json({ message: "Transaction locked permanently" });
};

exports.listTransactions = async (req, res) => {
  try {
    const filters = { ...req.query };

    // 🔐 If not admin, show only user's own transactions
    if (req.user.role !== "ADMIN") {
      filters.userId = req.user.id;
    }

    const txns = await Transaction.find(filters)
      .sort({ createdAt: -1 }) // ✅ newest first
      .populate("bookingId userId verifiedBy");

    res.json(txns);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
};

exports.createPayment = async (req, res) => {
    const txn = await Transaction.create({
        bookingId: req.body.bookingId,
        userId: req.user.id,
        amount: req.body.amount,
        direction: "IN",
        paymentMode: req.body.paymentMode,
        transactionRef: req.body.transactionRef,
        isOffline: req.body.isOffline,
        status: "SUCCESS"
    });

    res.json(txn);
};

exports.createRefund = async (req, res) => {
    const originalTxn = await Transaction.findById(req.body.refundOf);

    if (!originalTxn || originalTxn.status !== "VERIFIED") {
        return res.status(400).json({ message: "Invalid original transaction" });
    }

    const refund = await Transaction.create({
        bookingId: originalTxn.bookingId,
        userId: originalTxn.userId,
        amount: req.body.amount,
        direction: "OUT",
        paymentMode: req.body.paymentMode, // DIFFERENT MODE ALLOWED
        transactionRef: req.body.transactionRef,
        isOffline: req.body.isOffline,
        refundOf: originalTxn._id,
        status: "PENDING",
        remarks: req.body.remarks
    });

    res.json(refund);
};