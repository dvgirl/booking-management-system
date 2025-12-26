const Doc = require("../models/MultiSourceDocument");

exports.uploadDocument = async (req, res) => {
    const {
        bookingId,
        documentType,
        source,
        isOffline,
        remarks
    } = req.body;

    if (!req.file) {
        return res.status(400).json({ message: "File required" });
    }

    const doc = await Doc.create({
        bookingId,
        userId: req.user.role === "USER" ? req.user.id : null,
        source,
        documentType,
        fileUrl: req.file.path,
        uploadedBy: req.user.id,
        isOffline,
        syncStatus: isOffline ? "PENDING" : "SYNCED",
        remarks
    });

    res.json({
        message: "Document tracked successfully",
        document: doc
    });
};

exports.verifyDocument = async (req, res) => {
    const doc = await Doc.findByIdAndUpdate(
        req.params.id,
        {
            verificationStatus: "VERIFIED",
            verifiedBy: req.user.id
        },
        { new: true }
    );

    res.json({
        message: "Document verified",
        document: doc
    });
};

exports.lockDocument = async (req, res) => {
    const doc = await Doc.findById(req.params.id);

    if (doc.locked) {
        return res.status(400).json({ message: "Already locked" });
    }

    doc.locked = true;
    await doc.save();

    res.json({ message: "Document locked permanently" });
};

exports.listDocuments = async (req, res) => {
    const filters = req.query;

    const docs = await Doc.find(filters)
        .populate("uploadedBy verifiedBy bookingId");

    res.json(docs);
};

exports.getDocumentById = async (req, res) => {
  const doc = await Document.findById(req.params.id)
    .populate("uploadedBy", "name");

  if (!doc) {
    return res.status(404).json({ message: "Document not found" });
  }

  res.json(doc);
};  