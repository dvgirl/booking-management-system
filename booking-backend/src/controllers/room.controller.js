const mongoose = require("mongoose");
const Room = require("../models/Room");

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.aggregate([
      { $match: { isBlocked: false } },
      {
        $lookup: {
          from: "bookings",
          localField: "_id",
          foreignField: "roomId",
          as: "bookings"
        }
      },
      {
        $addFields: {
          bookingsCount: { $size: "$bookings" }
        }
      },
      { $sort: { roomNumber: 1 } },
      {
        $project: {
          bookings: 0
        }
      }
    ]);

    res.json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ message: "Error fetching rooms" });
  }
};


// ================= GET ROOM BY ID =================
exports.getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }
        res.json(room);
    } catch (error) {
        console.error("Error fetching room:", error);
        res.status(500).json({ message: error.message || "Error fetching room" });
    }
};

// ================= CREATE ROOM (ADMIN) =================
exports.createRoom = async (req, res) => {
    try {
        const { roomNumber, type, price, amenities, allowedRoles, description, capacity } = req.body;

        if (!roomNumber || !price) {
            return res.status(400).json({ message: "Room number and price are required" });
        }

        // Check if room number already exists
        const existingRoom = await Room.findOne({ roomNumber });
        if (existingRoom) {
            return res.status(400).json({ message: "Room number already exists" });
        }

        const room = await Room.create({
            roomNumber,
            type: type || "Standard",
            price,
            amenities: amenities || [],
            allowedRoles: allowedRoles || ["USER", "ADMIN", "SUPER_ADMIN"],
            description: description || "",
            capacity: capacity || 1,
            isBlocked: false
        });

        res.status(201).json({
            message: "Room created successfully",
            room
        });
    } catch (error) {
        console.error("Error creating room:", error);
        res.status(500).json({ message: error.message || "Error creating room" });
    }
};

// ================= UPDATE ROOM (ADMIN) =================
exports.updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const { roomNumber, type, price, amenities, allowedRoles, description, capacity, isBlocked } = req.body;

        const room = await Room.findById(id);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // // Check if room number already exists (excluding current room)
        // if (roomNumber && roomNumber !== room.roomNumber) {
        //     const existingRoom = await Room.findOne({ roomNumber });
        //     if (existingRoom) {
        //         return res.status(400).json({ message: "Room number already exists" });
        //     }
        // }

        const updatedRoom = await Room.findByIdAndUpdate(
            id,
            {
                roomNumber: roomNumber || room.roomNumber,
                type: type || room.type,
                price: price !== undefined ? price : room.price,
                amenities: amenities || room.amenities,
                allowedRoles: allowedRoles || room.allowedRoles,
                description: description !== undefined ? description : room.description,
                capacity: capacity || room.capacity,
                isBlocked: isBlocked !== undefined ? isBlocked : room.isBlocked
            },
            { new: true }
        );

        res.json({
            message: "Room updated successfully",
            room: updatedRoom
        });
    } catch (error) {
        console.error("Error updating room:", error);
        res.status(500).json({ message: error.message || "Error updating room" });
    }
};

// ================= DELETE ROOM (ADMIN) =================
exports.deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;

        const room = await Room.findById(id);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Check if room has active bookings
        const Booking = require("../models/Booking");
        const activeBookings = await Booking.find({
            roomId: id,
            status: { $in: ["PENDING", "CONFIRMED", "CHECKED_IN"] }
        });

        if (activeBookings.length > 0) {
            return res.status(400).json({
                message: "Cannot delete room with active bookings. Cancel all bookings first."
            });
        }

        await Room.findByIdAndDelete(id);

        res.json({ message: "Room deleted successfully" });
    } catch (error) {
        console.error("Error deleting room:", error);
        res.status(500).json({ message: error.message || "Error deleting room" });
    }
};

// ================= GET ROOMS BY USER ROLE =================
exports.getRoomsByUserRole = async (req, res) => {
    try {
        const userRole = req.user.role; // Assuming user is attached by auth middleware

        const rooms = await Room.find({
            isBlocked: false,
            allowedRoles: { $in: [userRole] }
        }).sort({ roomNumber: 1 });

        res.json(rooms);
    } catch (error) {
        console.error("Error fetching rooms by role:", error);
        res.status(500).json({ message: error.message || "Error fetching rooms" });
    }
};