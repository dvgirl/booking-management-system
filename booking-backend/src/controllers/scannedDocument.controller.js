const ScannedDocument = require("../models/ScannedDocument");

exports.uploadScannedDoc = async (req, res) => {
    const { bookingId, type, reportDate, remarks } = req.body;

    if (!req.file) {
        return res.status(400).json({ message: "File required" });
    }

    const doc = await ScannedDocument.create({
        bookingId,
        type,
        reportDate,
        fileUrl: req.file.path,
        remarks,
        uploadedBy: req.user.id
    });

    res.json({
        message: "Scanned document uploaded",
        document: doc
    });
};

exports.lockDocument = async (req, res) => {
    const doc = await ScannedDocument.findById(req.params.id);

    if (doc.locked) {
        return res.status(400).json({ message: "Document already locked" });
    }

    doc.locked = true;
    await doc.save();

    res.json({ message: "Document locked successfully" });
};

exports.getDocumentsByDate = async (req, res) => {
    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);

    const docs = await ScannedDocument.find({
        reportDate: date
    }).populate("uploadedBy bookingId");

    res.json(docs);
};

exports.getBookingDocuments = async (req, res) => {
    const docs = await ScannedDocument.find({
        bookingId: req.params.bookingId
    });

    res.json(docs);
};
