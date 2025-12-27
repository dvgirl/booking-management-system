const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const {
    checkAvailability,
    createBooking,
    calendarView,
    checkIn,
    checkOut,
    onlineBooking,
    adminBooking,
    modifyBooking,
    cancelBooking,
    physicalCheckIn,
    confirmBooking,
    offlineBooking,
    offlineCheckIn,
    attachKycToBooking,
    searchBooking,
    getCheckInHistory,
    getBookingHistory,
    getPendingBookings,
    getBookingDetails,
    updateBookingStatus,
    getBookingsByStatus,
    getImminentCheckouts
} = require("../controllers/booking.controller");
const Booking = require("../models/Booking");

// Public/User routes
router.get("/availability", auth, checkAvailability);
router.get("/calendar", auth, calendarView);
router.get("/search", auth, searchBooking); // Must be before /:id routes
router.get("/checkin-history", auth, getCheckInHistory);
router.post("/", auth, createBooking);
router.post("/online", auth, onlineBooking);
router.patch("/:id/modify", auth, modifyBooking);
router.patch("/:id/cancel", auth, cancelBooking);

// Admin routes
router.post(
    "/admin",
    auth,
    role("ADMIN", "SUPER_ADMIN"),
    adminBooking
);

router.post(
    "/offline",
    auth,
    role("ADMIN", "SUPER_ADMIN"),
    offlineBooking
);

router.patch(
    "/:id",
    auth,
    role("ADMIN", "SUPER_ADMIN"),
    modifyBooking
);

router.patch(
    "/:id/check-in",
    auth,
    role("ADMIN", "SUPER_ADMIN"),
    checkIn
);

router.patch(
    "/:id/check-out",
    auth,
    role("ADMIN", "SUPER_ADMIN"),
    checkOut
);

router.patch(
    "/:id/physical-checkin",
    auth,
    role("ADMIN", "SUPER_ADMIN"),
    physicalCheckIn
);

router.patch(
    "/:id/confirm",
    auth,
    role("ADMIN", "SUPER_ADMIN"),
    confirmBooking
);

router.patch(
    "/:id/offline-checkin",
    auth,
    role("ADMIN", "SUPER_ADMIN"),
    offlineCheckIn
);

router.patch(
    "/:id/attach-kyc",
    auth,
    attachKycToBooking
);

// Validate booking
router.get("/validate/:bookingId", async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);
        res.json({
            valid: booking && booking.status !== "CANCELLED"
        });
    } catch (error) {
        console.error("Error validating booking:", error);
        res.status(500).json({ message: error.message || "Error validating booking" });
    }
});

router.get(
    "/admin/pending",
    auth,
    role("ADMIN", "SUPER_ADMIN"),
    getPendingBookings
);

router.get(
    "/BookingsByStatus",
    auth,
    getBookingsByStatus
);

router.get(
    "/admin/:id",
    auth,
    role("ADMIN", "SUPER_ADMIN"),
    getBookingDetails
);

router.patch(
    "/:id/status",
    auth,
    role("ADMIN", "SUPER_ADMIN"),
    updateBookingStatus
);

router.get(
    "/imminent-checkouts",
    auth,
    getImminentCheckouts
);

module.exports = router;
