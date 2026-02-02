const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const {
    getAllHotels,
    getHotelById,
    createHotel,
    updateHotel,
    deleteHotel,
    getAvailableManagers
} = require("../controllers/hotel.controller");

// Only SUPER_ADMIN can manage the hotel portfolio
router.get("/", auth, role("SUPER_ADMIN"), getAllHotels);

router.post("/", auth, role("SUPER_ADMIN"), createHotel);

router.get("/available-managers", auth, role("SUPER_ADMIN") , getAvailableManagers)

router.get("/:id", auth, getHotelById);

router.put("/:id", auth, role("SUPER_ADMIN"), updateHotel);

router.delete("/:id", auth, role("SUPER_ADMIN"), deleteHotel);



module.exports = router;