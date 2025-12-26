const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
    getRoomsByUserRole
} = require("../controllers/room.controller");

// Get all rooms (available to authenticated users)
router.get("/", auth, getAllRooms);

// Get rooms available for user's role
router.get("/available", auth, getRoomsByUserRole);

// Create room (admin only)
router.post("/", auth, role("ADMIN", "SUPER_ADMIN"), createRoom);

// Get room by ID
router.get("/:id", auth, getRoomById);

// Update room (admin only)
router.put("/:id", auth, role("ADMIN", "SUPER_ADMIN"), updateRoom);

// Delete room (admin only)
router.delete("/:id", auth, role("ADMIN", "SUPER_ADMIN"), deleteRoom);

module.exports = router;
