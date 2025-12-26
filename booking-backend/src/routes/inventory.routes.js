const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const { blockRoom, getBookingHistory } = require("../controllers/inventory.controller");

router.post(
    "/block",
    auth,
    role("ADMIN", "SUPER_ADMIN"),
    blockRoom
);

router.get(
    "/bookings/:id/history",
    auth,
    role("ADMIN", "SUPER_ADMIN"),
    getBookingHistory
  );

module.exports = router;
