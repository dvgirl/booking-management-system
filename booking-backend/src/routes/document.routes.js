const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const {
    generateBookingDocument
} = require("../controllers/document.controller");

router.post(
    "/generate/:bookingId",
    auth,
    generateBookingDocument
);

module.exports = router;
