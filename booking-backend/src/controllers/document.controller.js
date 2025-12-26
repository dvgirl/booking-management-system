const Document = require("../models/Document");
const Booking = require("../models/Booking");
const docService = require("../services/document.service");

exports.generateBookingDocument = async (req, res) => {
    const booking = await Booking.findById(req.params.bookingId)
        .populate("roomId");

    if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
    }

    const fileUrl = await docService.generateBookingConfirmation(booking);

    const document = await Document.create({
        bookingId: booking._id,
        type: "BOOKING_CONFIRMATION",
        fileUrl,
        generatedBy: req.user.id
    });

    res.json({
        message: "Document generated successfully",
        document
    });
};
