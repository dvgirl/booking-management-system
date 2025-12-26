const RoomInventory = require("../models/RoomInventory");
const BookingChangeHistory = require("../models/BookingChangeHistory");


// Helper function to get dates between start and end
const getDates = (start, end) => {
    try {
        let dates = [];
        let d = new Date(start);
        const endDate = new Date(end);

        while (d < endDate) {
            dates.push(new Date(d));
            d.setDate(d.getDate() + 1);
        }
        return dates;
    } catch (error) {
        console.error("Error generating dates:", error);
        throw error;
    }
};

// Helper function to check if room is available
const isAvailable = async (roomId, checkIn, checkOut) => {
    try {
        const dates = getDates(checkIn, checkOut);
        const conflicts = await RoomInventory.find({
            roomId,
            date: { $in: dates },
            $or: [
                { bookingId: { $ne: null } },
                { isBlocked: true }
            ]
        });
        return conflicts.length === 0;
    } catch (error) {
        console.error("Error checking availability:", error);
        return false;
    }
};

// Block room for specific dates
exports.blockRoom = async (req, res) => {
    try {
        const { roomId, from, to } = req.body;

        if (!roomId || !from || !to) {
            return res.status(400).json({ message: "Room ID, from date, and to date are required" });
        }

        const dates = getDates(from, to);

        for (let date of dates) {
            await RoomInventory.findOneAndUpdate(
                { roomId, date },
                { isBlocked: true },
                { upsert: true }
            );
        }

        res.json({ message: "Room blocked successfully" });
    } catch (error) {
        console.error("Error blocking room:", error);
        res.status(500).json({ message: error.message || "Error blocking room" });
    }
};

// ================= GET BOOKING CHANGE HISTORY =================
exports.getBookingHistory = async (req, res) => {
    try {
        const { id } = req.params;

        const history = await BookingChangeHistory.find({ bookingId: id })
            .populate("changedBy", "name phone role")
            .sort({ createdAt: -1 });

        res.json(history);
    } catch (error) {
        console.error("Error fetching booking history:", error);
        res.status(500).json({
            message: "Error fetching booking history"
        });
    }
};


// Export helper functions for use in other controllers
exports.getDates = getDates;
exports.isAvailable = isAvailable;
