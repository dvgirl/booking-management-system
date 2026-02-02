const mongoose = require("mongoose");
const Room = require("../models/Room");

exports.getAllRooms = async (req, res) => {
  try {
    const { role, hotelId } = req.user; // Extracted from Auth middleware
    const { city, state, type } = req.query; // Filters from frontend

    // 1. Build the Dynamic Match Filter
    let matchFilter = { isBlocked: false };

    // BOUNDARY LOGIC:
    // If Admin, lock them to their specific hotelId
    if (role === "ADMIN") {
      if (!hotelId) {
        return res.status(403).json({ message: "Admin not assigned to a hotel" });
      }
      matchFilter.hotelId = hotelId; 
    }

    // QUERY FILTERS:
    // Apply city/state filters if they are provided in the URL (e.g., ?city=Mumbai)
    if (city) matchFilter.city = { $regex: city, $options: "i" };
    if (state) matchFilter.state = { $regex: state, $options: "i" };
    if (type) matchFilter.type = type;

    // 2. Execute Aggregation
    const rooms = await Room.aggregate([
      { $match: matchFilter },
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
      // Optional: Lookup Hotel details if needed for display
      {
        $lookup: {
          from: "hotels",
          localField: "hotelId",
          foreignField: "_id",
          as: "hotelDetails"
        }
      },
      { $unwind: { path: "$hotelDetails", preserveNullAndEmptyArrays: true } },
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
        const { 
            roomNumber, 
            type, 
            price, 
            amenities, 
            allowedRoles, 
            description, 
            capacity,
            // New fields from request body
            city,
            state,
            hotelId 
        } = req.body;

        // 1. Enhanced Validation
        if (!roomNumber || !price || !city || !state) {
            return res.status(400).json({ 
                message: "Room number, price, city, and state are required" 
            });
        }

        // 2. Scoped Uniqueness Check
        // We check if the room number exists WITHIN the same hotel/city context
        const query = { roomNumber };
        if (hotelId) query.hotelId = hotelId;
        else query.city = city; // Fallback if hotelId isn't implemented yet

        const existingRoom = await Room.findOne(query);
        
        if (existingRoom) {
            return res.status(400).json({ 
                message: `Room ${roomNumber} already exists in ${city}` 
            });
        }

        // 3. Create Room with Location Metadata
        const room = await Room.create({
            roomNumber,
            type: type || "Standard",
            price,
            amenities: amenities || [],
            allowedRoles: allowedRoles || ["USER", "ADMIN", "SUPER_ADMIN"],
            description: description || "",
            capacity: capacity || 1,
            isBlocked: false,
            // New fields added incrementally
            city,
            state,
            hotelId: hotelId || null // Ensure this matches your User's hotel context
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
        const { 
            roomNumber, 
            type, 
            price, 
            amenities, 
            allowedRoles, 
            description, 
            capacity, 
            isBlocked,
            // New fields to support multi-hotel/location
            city,
            state,
            hotelId 
        } = req.body;

        const room = await Room.findById(id);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // 1. Scoped Uniqueness Check
        // If the roomNumber is being changed, check if it's already taken 
        // in the specific hotel/location context.
        if (roomNumber && roomNumber.toString() !== room.roomNumber.toString()) {
            const contextHotelId = hotelId || room.hotelId;
            const contextCity = city || room.city;

            const duplicateQuery = { 
                roomNumber, 
                _id: { $ne: id } // Exclude the current room
            };

            // Ensure we check within the correct hotel boundary
            if (contextHotelId) duplicateQuery.hotelId = contextHotelId;
            else if (contextCity) duplicateQuery.city = contextCity;

            const existingRoom = await Room.findOne(duplicateQuery);
            if (existingRoom) {
                return res.status(400).json({ 
                    message: `Room number ${roomNumber} already exists in this location.` 
                });
            }
        }

        // 2. Perform Incremental Update
        // We use the spread operator or explicit mapping to ensure new fields are saved
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
                isBlocked: isBlocked !== undefined ? isBlocked : room.isBlocked,
                // Add new location/tenant fields
                city: city || room.city,
                state: state || room.state,
                hotelId: hotelId || room.hotelId
            },
            { new: true, runValidators: true }
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