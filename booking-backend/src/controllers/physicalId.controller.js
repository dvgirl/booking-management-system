const PhysicalId = require("../models/PhysicalId");
const Booking = require("../models/Booking");

// const PhysicalID = require("../models/PhysicalID");

exports.addID = async (req, res) => {
    const { bookingId, idType, idNumber, verifiedBy, photoUrl } = req.body;
    const idRecord = new PhysicalId({
        bookingId,
        idType,
        idNumber,
        verifiedBy,
        photoUrl,
        verifiedAt: new Date()
    });
    await idRecord.save();
    res.status(201).json(idRecord);
};

exports.getAllIDs = async (req, res) => {
    const ids = await PhysicalId.find().populate("bookingId");
    res.json(ids);
};

exports.getIDByBooking = async (req, res) => {
    const idRecord = await PhysicalId.findOne({ bookingId: req.params.bookingId });
    res.json(idRecord);
};

exports.collectPhysicalId = async (req, res) => {
    const { idType, idLast4, lockerNumber } = req.body;

    const booking = await Booking.findById(req.params.bookingId);
    if (!booking || booking.status !== "CHECKED_IN") {
        return res.status(400).json({ message: "Invalid booking status" });
    }

    const record = await PhysicalId.create({
        bookingId: booking._id,
        guestName: booking.guestName,
        idType,
        idLast4,
        lockerNumber,
        collectedBy: req.user.id
    });

    res.json({
        message: "Physical ID collected and recorded",
        record
    });
};

exports.listActiveIds = async (req, res) => {
    const ids = await PhysicalId.find({ status: "COLLECTED" })
        .populate("bookingId collectedBy");

    res.json(ids);
};

exports.returnPhysicalId = async (req, res) => {
    const record = await PhysicalId.findByIdAndUpdate(
        req.params.id,
        {
            status: "RETURNED",
            returnedAt: new Date(),
            returnedBy: req.user.id
        },
        { new: true }
    );

    res.json({
        message: "Physical ID returned successfully",
        record
    });
};


exports.markLost = async (req, res) => {
    const record = await PhysicalId.findByIdAndUpdate(
        req.params.id,
        {
            status: "LOST",
            remarks: req.body.remarks
        },
        { new: true }
    );

    res.json({
        message: "ID marked as lost",
        record
    });
};
