const Booking = require("../models/Booking");
const Transaction = require("../models/Transaction");
const Room = require("../models/Room");
const DailyReport = require("../models/DailyReport");
const Kyc = require("../models/Kyc");
const ProcessTracker = require("../models/ProcessTracker");

exports.generateDailyReport = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const [
      bookings,
      transactions, // Updated
      totalRooms
    ] = await Promise.all([
      Booking.find({ createdAt: { $gte: start, $lte: end } }),
      Transaction.find({
        createdAt: { $gte: start, $lte: end },
        status: { $in: ["SUCCESS", "VERIFIED"] }, // Only count valid money
        direction: "IN" // Only count money coming in
      }),
      Room.countDocuments()
    ]);

    const report = {
      date: start,

      bookings: {
        total: bookings.length,
        confirmed: bookings.filter(b => b.status === "CONFIRMED").length,
        cancelled: bookings.filter(b => b.status === "CANCELLED").length
      },

      checkInOut: {
        checkedIn: bookings.filter(b => b.status === "CHECKED_IN").length,
        checkedOut: bookings.filter(b => b.status === "CHECKED_OUT").length
      },

      occupancy: {
        totalRooms,
        occupiedRooms: bookings.filter(b => b.status === "CHECKED_IN").length
      },

      revenue: {
        // Updated to use paymentMode and Transaction schema
        total: transactions.reduce((a, b) => a + (b.amount || 0), 0),
        cash: transactions.filter(p => p.paymentMode === "CASH").reduce((a, b) => a + (b.amount || 0), 0),
        upi: transactions.filter(p => p.paymentMode === "UPI").reduce((a, b) => a + (b.amount || 0), 0),
        razorpay: transactions.filter(p => p.paymentMode === "RAZORPAY").reduce((a, b) => a + (b.amount || 0), 0),
        bank: transactions.filter(p => p.paymentMode === "BANK_TRANSFER").reduce((a, b) => a + (b.amount || 0), 0)
      },

      pendingPayments: bookings.filter(b => b.paymentStatus !== "PAID").length,
      generatedBy: req.user.id
    };

    await DailyReport.findOneAndUpdate(
      { date: start },
      report,
      { upsert: true, new: true }
    );

    res.json({
      message: "Daily report generated for today",
      report
    });
  } catch (error) {
    console.error("Error generating daily report:", error);
    res.status(500).json({ message: "Error generating report" });
  }
};

exports.getDailyReports = async (req, res) => {
  try {
    const reports = await DailyReport.find().sort({ date: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDailyReport = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    date.setHours(0, 0, 0, 0);

    const report = await DailyReport.findOne({ date });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const [
      todaysCheckIns,
      todaysCheckOuts,
      pendingKyc,
      openTasks,
      activeBookings,
      todaysTransactions // Updated
    ] = await Promise.all([
      Booking.countDocuments({
        status: "CHECKED_IN",
        checkIn: { $gte: today, $lte: endOfToday }
      }),
      Booking.countDocuments({
        status: "CHECKED_OUT",
        checkOut: { $gte: today, $lte: endOfToday }
      }),
      Kyc.countDocuments({ kycStatus: "PENDING" }),
      ProcessTracker.countDocuments({
        status: { $in: ["OPEN", "ASSIGNED", "IN_PROGRESS"] }
      }),
      Booking.countDocuments({
        status: { $in: ["CONFIRMED", "CHECKED_IN"] }
      }),
      Transaction.find({
        createdAt: { $gte: today, $lte: endOfToday },
        status: { $in: ["SUCCESS", "VERIFIED"] },
        direction: "IN"
      })
    ]);

    const todaysRevenue = todaysTransactions.reduce(
      (sum, t) => sum + (t.amount || 0),
      0
    );

    res.json({
      todaysCheckIns,
      todaysCheckOuts,
      pendingKyc,
      openTasks,
      activeBookings,
      todaysRevenue
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const [recentBookings, recentTransactions] = await Promise.all([
      Booking.find()
        .populate("roomId", "roomNumber")
        .populate("userId", "phone name")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),

      Transaction.find()
        .populate("userId", "name")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean()
    ]);

    const activities = [];

    recentBookings.forEach(b => {
      activities.push({
        type: "BOOKING",
        icon: "🏨",
        title: "New booking created",
        description: `Room ${b.roomId?.roomNumber || "N/A"} - ${b.userId?.name || "Guest"}`,
        timestamp: b.createdAt
      });
    });

    recentTransactions.forEach(t => {
      const dirText = t.direction === "IN" ? "Payment Received" : "Refund Issued";
      const icon = t.direction === "IN" ? "💰" : "🔄";

      activities.push({
        type: "TRANSACTION",
        icon: icon,
        title: dirText,
        description: `₹${t.amount || 0} via ${t.paymentMode} (${t.status})`,
        timestamp: t.createdAt
      });
    });

    // Sort combined activities by time
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(activities.slice(0, limit));
  } catch (error) {
    console.error("Recent activity error:", error);
    res.status(500).json({ message: "Error fetching activity" });
  }
}