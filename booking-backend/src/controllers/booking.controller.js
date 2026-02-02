const Booking = require("../models/Booking");
const Room = require("../models/Room");
const RoomInventory = require("../models/RoomInventory");
const User = require("../models/User");
const mongoose = require("mongoose");
const bookingPopulate = require("../utils/bookingPopulate");


const generateConfirmation = () => {
    return "BK" + Date.now();
};

// Helper function to get dates between checkIn and checkOut
const getDates = (checkIn, checkOut) => {
    const dates = [];
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
        dates.push(new Date(date).toISOString().split('T')[0]);
    }

    return dates;
};

exports.getPendingBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ status: "PENDING" })
            .populate("userId", "name phone")
            .populate("roomId", "roomNumber")
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: "Failed to load pending bookings" });
    }
};

exports.getBookingDetails = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("userId", "name phone email")
            .populate("roomId", "roomNumber type price")
            .populate({
                path: "kycIds",
                select: "type fullName aadhaarLast4 documentUrl kycStatus verifiedByOfficer verifiedAt"
            });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.json({
            bookingId: booking._id,
            status: booking.status,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,

            user: booking.userId,
            room: booking.roomId,

            kycList: booking.kycIds
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to load booking details" });
    }
};

exports.getBookingsByStatus = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};

        // 1. Status Filter
        if (status) {
            filter.status = status.toUpperCase();
        }

        // 2. 🔐 Role-Based Access Control
        if (req.user.role === "ADMIN") {
            // Admin only sees bookings for their assigned hotel
            // Assumes Booking model has a 'hotelId' field
            filter.hotelId = req.user.hotelId;
        } else if (req.user.role === "USER") {
            // Regular users see only their own bookings
            filter.userId = req.user.id;
        } 
        // Note: If role is SUPER_ADMIN, no filter is added (sees all)

        const bookings = await Booking.find(filter)
            .populate("userId", "name phone")
            .populate("roomId", "roomNumber")
            .sort({ createdAt: -1 });

        res.status(200).json(bookings);
    } catch (error) {
        console.error("Booking Fetch Error:", error);
        res.status(500).json({ message: "Failed to fetch bookings" });
    }
};

// Helper function to check if room is available
const isAvailable = async (roomId, checkIn, checkOut) => {
    try {
        const conflict = await Booking.findOne({
            roomId,
            status: { $nin: ["CANCELLED"] },
            checkIn: { $lt: new Date(checkOut) },
            checkOut: { $gt: new Date(checkIn) }
        });

        return !conflict;
    } catch (error) {
        console.error("Error checking availability:", error);
        return false;
    }
};

// Allocate inventory for booking dates
const allocateInventory = async (booking) => {
    try {
        const dates = getDates(booking.checkIn, booking.checkOut);

        for (let date of dates) {
            await RoomInventory.findOneAndUpdate(
                { roomId: booking.roomId, date },
                { bookingId: booking._id },
                { upsert: true }
            );
        }
    } catch (error) {
        console.error("Error allocating inventory:", error);
        throw error;
    }
};

// Release inventory for booking
const releaseInventory = async (booking) => {
    try {
        await RoomInventory.deleteMany({ bookingId: booking._id });
    } catch (error) {
        console.error("Error releasing inventory:", error);
        throw error;
    }
};

// ================= CHECK AVAILABILITY =================
exports.checkAvailability = async (req, res) => {
    try {
        const { checkIn, checkOut, city } = req.query;
        const userRole = req.user.role; 

        if (!checkIn || !checkOut) {
            return res.status(400).json({ message: "Check-in and Check-out dates are required" });
        }

        // 1. Find all rooms that are ALREADY booked for these dates
        // Logic: (Existing CheckIn < User CheckOut) AND (Existing CheckOut > User CheckIn)
        const bookedRooms = await Booking.find({
            status: { $ne: "CANCELLED" },
            $or: [
                {
                    checkIn: { $lt: new Date(checkOut) },
                    checkOut: { $gt: new Date(checkIn) }
                }
            ]
        }).select("roomId");

        const bookedRoomIds = bookedRooms.map(b => b.roomId);

        // 2. Build the Room Query
        let roomQuery = {
            isBlocked: false,
            _id: { $nin: bookedRoomIds },
            allowedRoles: { $in: [userRole] }
        };

        // 3. Multi-Hotel / City Filtering
        // If the user typed a city in the frontend search bar, filter rooms by that city
        if (city && city.trim() !== "") {
            roomQuery.city = { $regex: city.trim(), $options: "i" }; // Case-insensitive search
        }

        // 4. Fetch Available Rooms and POPULATE Hotel Details
        // We populate 'hotelId' to get the Hotel Name, Full Address, etc.
        const availableRooms = await Room.find(roomQuery)
            .populate({
                path: 'hotelId',
                select: 'name city state address description'
            })
            .sort({ price: 1 }); // Sort by cheapest first for better UX

        res.status(200).json({
            success: true,
            count: availableRooms.length,
            availableRooms
        });

    } catch (error) {
        console.error("Error checking availability:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Error checking availability" 
        });
    }
};

// ================= CREATE BOOKING =================
exports.createBooking = async (req, res) => {
    try {
        const { roomId, checkIn, checkOut , bookingSource} = req.body;
        const userRole = req.user.role;

        if (!roomId || !checkIn || !checkOut) {
            return res.status(400).json({ message: "Room ID, check-in and check-out dates are required" });
        }

        // Check if user has permission to book this room
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        if (!room.allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: "You don't have permission to book this room" });
        }

        const conflict = await Booking.findOne({
            roomId,
            status: { $ne: "CANCELLED" },
            checkIn: { $lt: new Date(checkOut) },
            checkOut: { $gt: new Date(checkIn) },
            
        });

        if (conflict) {
            return res.status(400).json({
                message: "Room not available for selected dates"
            });
        }

        // Calculate total amount
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const numberOfNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const totalAmount = room.price * numberOfNights;

        const booking = await Booking.create({
            userId: req.user.id,
            roomId,
            checkIn,
            checkOut,
            totalAmount,
            status: "PENDING",
            bookingSource
        });

        res.status(201).json({
            message: "Booking confirmed",
            booking
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({ message: error.message || "Error creating booking" });
    }
};

// ================= CALENDAR VIEW =================
exports.calendarView = async (req, res) => {
    try {
        const { role, id } = req.user;

        let filter = {};

        // 🔥 ROLE-BASED FILTER
        if (role !== "ADMIN") {
            filter.userId = id; // user sees only own bookings
        }

        const bookings = await Booking.find(filter)
            .populate("roomId", "roomNumber")
            .populate("userId", "phone")
            .sort({ checkIn: 1 });

        res.json(bookings);
    } catch (error) {
        console.error("Calendar booking error:", error);
        res.status(500).json({ message: "Failed to load calendar bookings" });
    }
};

// ================= CHECK IN =================
exports.checkIn = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: "CHECKED_IN" },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.json({ message: "Guest checked in", booking });
    } catch (error) {
        console.error("Error checking in:", error);
        res.status(500).json({ message: error.message || "Error checking in" });
    }
};

// ================= CHECK OUT =================
exports.checkOut = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: "CHECKED_OUT" },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.json({ message: "Guest checked out", booking });
    } catch (error) {
        console.error("Error checking out:", error);
        res.status(500).json({ message: error.message || "Error checking out" });
    }
};

// ================= ONLINE BOOKING =================
exports.onlineBooking = async (req, res) => {
    try {
        const { roomId, checkIn, checkOut } = req.body;
        const userRole = req.user.role;

        if (!roomId || !checkIn || !checkOut) {
            return res.status(400).json({ message: "Room ID, check-in and check-out dates are required" });
        }

        // Check if user has permission to book this room
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        if (!room.allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: "You don't have permission to book this room" });
        }

        const conflict = await Booking.findOne({
            roomId,
            status: { $nin: ["CANCELLED"] },
            checkIn: { $lt: new Date(checkOut) },
            checkOut: { $gt: new Date(checkIn) }
        });

        if (conflict) {
            return res.status(400).json({
                message: "Room not available"
            });
        }

        // Calculate total amount
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const numberOfNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const totalAmount = room.price * numberOfNights;

        const booking = await Booking.create({
            userId: req.user.id,
            roomId,
            checkIn,
            checkOut,
            totalAmount,
            status: "CONFIRMED",
            bookingSource: "ONLINE",
            confirmationNumber: generateConfirmation()
        });

        // 🔔 Send SMS / Email here
        console.log("Booking Confirmed:", booking.confirmationNumber);

        res.status(201).json({
            message: "Booking confirmed",
            booking
        });
    } catch (error) {
        console.error("Error creating online booking:", error);
        res.status(500).json({ message: error.message || "Error creating booking" });
    }
};

// ================= ADMIN BOOKING =================
exports.adminBooking = async (req, res) => {
    try {
        const { userId, roomId, checkIn, checkOut } = req.body;

        if (!userId || !roomId || !checkIn || !checkOut) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if room exists
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Calculate total amount
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const numberOfNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const totalAmount = room.price * numberOfNights;

        const booking = await Booking.create({
            userId,
            roomId,
            checkIn,
            checkOut,
            totalAmount,
            status: "CONFIRMED",
            bookingSource: "ADMIN",
            confirmationNumber: generateConfirmation()
        });

        res.status(201).json({
            message: "Booking created by admin",
            booking
        });
    } catch (error) {
        console.error("Error creating admin booking:", error);
        res.status(500).json({ message: error.message || "Error creating booking" });
    }
};

// ================= MODIFY BOOKING =================
exports.modifyBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        const oldData = { ...booking._doc };

        // Release old inventory
        await releaseInventory(booking);

        // Check if new dates are available
        const available = await isAvailable(
            req.body.roomId || booking.roomId,
            req.body.checkIn || booking.checkIn,
            req.body.checkOut || booking.checkOut
        );

        if (!available && req.user.role === "USER") {
            // Rollback - reallocate old inventory
            await allocateInventory(booking);
            return res.status(400).json({ message: "New dates not available" });
        }

        // Update booking
        Object.assign(booking, req.body);

        // Recalculate total amount if dates or room changed
        if (req.body.checkIn || req.body.checkOut || req.body.roomId) {
            const roomId = req.body.roomId || booking.roomId;
            const room = await Room.findById(roomId);
            if (room) {
                const checkInDate = new Date(req.body.checkIn || booking.checkIn);
                const checkOutDate = new Date(req.body.checkOut || booking.checkOut);
                const numberOfNights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
                booking.totalAmount = room.price * numberOfNights;
            }
        }

        await booking.save();

        // Allocate new inventory
        await allocateInventory(booking);

        // Add modification history if field exists
        if (booking.modificationHistory) {
            booking.modificationHistory.push({
                modifiedBy: req.user.id,
                changes: req.body,
                modifiedAt: new Date()
            });
            await booking.save();
        }

        res.json({
            message: "Booking modified",
            booking
        });
    } catch (error) {
        console.error("Error modifying booking:", error);
        res.status(500).json({ message: error.message || "Error modifying booking" });
    }
};

// ================= CANCEL BOOKING =================
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Release inventory
        await releaseInventory(booking);

        booking.status = "CANCELLED";
        await booking.save();

        res.json({ message: "Booking cancelled", booking });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({ message: error.message || "Error cancelling booking" });
    }
};

// ================= PHYSICAL CHECK IN =================
exports.physicalCheckIn = async (req, res) => {
    try {
        const { kycIds } = req.body;

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            {
                status: "CHECKED_IN",
                kycIds: kycIds || booking.kycIds,
                checkInVerified: true
            },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.json({
            message: "Guest checked in successfully",
            booking
        });
    } catch (error) {
        console.error("Error in physical check-in:", error);
        res.status(500).json({ message: error.message || "Error checking in" });
    }
};

// ================= CONFIRM BOOKING =================
exports.confirmBooking = async (req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "PENDING") {
        return res.status(400).json({ message: "Booking already processed" });
    }

    booking.status = "CONFIRMED";
    booking.confirmationNumber = `CNF-${Date.now()}`;

    booking.modificationHistory.push({
        modifiedBy: req.user.id,
        changes: { status: "CONFIRMED" },
        modifiedAt: new Date()
    });

    await booking.save();

    res.json({ message: "Booking confirmed", booking });
};

// ================= OFFLINE BOOKING =================
exports.offlineBooking = async (req, res) => {
    try {
        const { guestName, roomId, checkIn, checkOut, note } = req.body;

        if (!guestName || !roomId || !checkIn || !checkOut) {
            return res.status(400).json({ message: "Required fields are missing" });
        }

        const booking = await Booking.create({
            guestName,
            roomId,
            checkIn,
            checkOut,
            status: "CONFIRMED",
            isOffline: true,
            kycStatus: "PENDING",
            offlineNote: note,
            bookingSource: "ADMIN",
            confirmationNumber: generateConfirmation()
        });

        res.status(201).json({
            message: "Offline booking created. KYC pending.",
            booking
        });
    } catch (error) {
        console.error("Error creating offline booking:", error);
        res.status(500).json({ message: error.message || "Error creating offline booking" });
    }
};

// ================= OFFLINE CHECK IN =================
exports.offlineCheckIn = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            {
                status: "CHECKED_IN",
                kycStatus: "PENDING"
            },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.json({
            message: "Offline check-in completed. KYC pending.",
            booking
        });
    } catch (error) {
        console.error("Error in offline check-in:", error);
        res.status(500).json({ message: error.message || "Error checking in" });
    }
};

// ================= ATTACH KYC TO BOOKING =================
exports.attachKycToBooking = async (req, res) => {
    try {
        const { kycIds } = req.body;

        if (!kycIds) {
            return res.status(400).json({ message: "KYC IDs are required" });
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            {
                kycIds,
                kycStatus: "VERIFIED"
            },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.json({ message: "KYC completed online", booking });
    } catch (error) {
        console.error("Error attaching KYC to booking:", error);
        res.status(500).json({ message: error.message || "Error attaching KYC" });
    }
};

// ================= SEARCH BOOKING =================
exports.searchBooking = async (req, res) => {
    try {
        const q = req.query.q?.trim();
        if (!q) {
            return res.status(400).json({ message: "Search query is required" });
        }

        let bookings = [];

        // 🔍 1. Search by Booking ID
        if (mongoose.Types.ObjectId.isValid(q)) {
            bookings = await Booking.find({ _id: q })
                .populate(bookingPopulate);
        }

        // 🔍 2. Search by confirmation number
        if (bookings.length === 0) {
            bookings = await Booking.find({
                confirmationNumber: new RegExp(q, "i")
            })
                .populate(bookingPopulate);
        }

        // 🔍 3. Search by phone number
        if (bookings.length === 0) {
            const users = await User.find({
                phone: new RegExp(q, "i")
            }).select("_id");

            if (users.length > 0) {
                bookings = await Booking.find({
                    userId: { $in: users.map(u => u._id) }
                })
                    .populate(bookingPopulate);
            }
        }

        res.json(bookings);
    } catch (error) {
        console.error("Error searching booking:", error);
        res.status(500).json({ message: "Error searching booking" });
    }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status, kycIds } = req.body;

    // Normalize status (in case object is sent)
    if (typeof status === "object" && status !== null) {
      status = status.status;
    }

    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "CHECKED_IN",
      "CHECKED_OUT",
      "CANCELLED"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid booking status"
      });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // ========================
    // Inventory Logic
    // ========================
    if (status === "CONFIRMED" && booking.status !== "CONFIRMED") {
      await allocateInventory(booking);
      booking.confirmationNumber = `CNF-${Date.now()}`;
    }

    if (
      (status === "CHECKED_OUT" || status === "CANCELLED") &&
      booking.status !== status
    ) {
      await releaseInventory(booking);
    }

    // ========================
    // Check-in Logic
    // ========================
    if (status === "CHECKED_IN") {
      if (Array.isArray(kycIds) && kycIds.length > 0) {
        booking.kycIds = kycIds;
      }
      booking.checkInVerified = true;
    }

    // ========================
    // Update Booking
    // ========================
    booking.status = status;

    booking.modificationHistory.push({
      modifiedBy: req.user.id,
      changes: { status },
      modifiedAt: new Date()
    });

    await booking.save();

    res.status(200).json({
      message: `Booking successfully updated to ${status}`,
      booking
    });

  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({
      message: error.message || "Failed to update booking"
    });
  }
};

// ================= GET CHECK-IN HISTORY =================
exports.getCheckInHistory = async (req, res) => {
    try {
        const bookings = await Booking.find({
            status: { $in: ["CHECKED_IN", "CHECKED_OUT"] }
        })
        .populate(bookingPopulate) // Mongoose handles this array of objects
        .sort({ checkIn: -1 })
        .limit(100);

        res.json(bookings);
    } catch (error) {
        console.error("Error fetching check-in history:", error);
        res.status(500).json({
            message: error.message || "Error fetching check-in history"
        });
    }
};

exports.getImminentCheckouts = async (req, res) => {
    try {
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

        const bookings = await Booking.find({
            status: "CHECKED_IN", // Only those currently in the hotel
            checkOut: {
                $gte: now,
                $lte: oneHourLater
            }
        }).populate("userId", "name phone");

        res.status(200).json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
