const Kyc = require("../models/Kyc");
const Booking = require("../models/Booking");


exports.uploadKyc = async (req, res) => {
    const { type, fullName, idLast4, idType } = req.body;

    if (!req.file) {
        return res.status(400).json({ message: "Document required" });
    }

    const kyc = await Kyc.create({
        userId: req.user.id,
        type,
        fullName,
        idLast4,
        idType,
        documentUrl: req.file.path
    });

    res.json({
        message: "KYC uploaded, pending verification",
        kyc
    });
};

exports.verifyKyc = async (req, res) => {
    const { kycId } = req.params;

    await Kyc.findByIdAndUpdate(kycId, {
        verifiedByOfficer: true,
        verifiedAt: new Date(),
        verifiedBy: req.user.id
    });

    res.json({ message: "KYC verified successfully" });
};

exports.submitKyc = async (req, res) => {
    try {
        const userId = req.user?._id || req.user?.id || req.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { self, spouse, children, bookingId } = req.body;
        const createdKycs = [];

        // 1. Check if the Aadhaar file exists
        if (!req.files?.selfAadhaar?.[0]) {
            return res.status(400).json({ message: "Aadhaar document file is required." });
        }

        const commonDocumentUrl = req.files.selfAadhaar[0].path;
        
        // 2. Parse Self Data and extract the Aadhaar Last 4 digits
        const selfData = JSON.parse(self);
        // Use the last 4 digits sent by frontend, or default to 0000 if somehow missing
        const extractedAadhaarLast4 = selfData.aadhaarLast4 || "0000";

        // 3. Create entry for SELF
        const kycSelf = await Kyc.create({
            userId,
            type: "SELF",
            fullName: selfData.name,
            aadhaarLast4: extractedAadhaarLast4,
            documentUrl: commonDocumentUrl,
            kycStatus: "PENDING"
        });
        createdKycs.push(kycSelf._id);

        // 4. Create entry for SPOUSE (if name provided)
        if (spouse) {
            const spouseData = JSON.parse(spouse);
            if (spouseData.name) {
                const kycSpouse = await Kyc.create({
                    userId,
                    type: "SPOUSE",
                    fullName: spouseData.name,
                    aadhaarLast4: extractedAadhaarLast4, // Link to primary Aadhaar
                    documentUrl: commonDocumentUrl
                });
                createdKycs.push(kycSpouse._id);
            }
        }

        // 5. Create entries for CHILDREN
        if (children) {
            const kids = JSON.parse(children);
            for (let child of kids) {
                if (child.name) {
                    const kycChild = await Kyc.create({
                        userId,
                        type: "CHILD",
                        fullName: child.name,
                        aadhaarLast4: extractedAadhaarLast4, // Link to primary Aadhaar
                        documentUrl: commonDocumentUrl
                    });
                    createdKycs.push(kycChild._id);
                }
            }
        }

        // 6. Update Booking with new KYC IDs
        if (bookingId && createdKycs.length) {
            await Booking.findByIdAndUpdate(
                bookingId,
                { $addToSet: { kycIds: { $each: createdKycs } } }
            );
        }

        res.json({
            message: "KYC submitted successfully",
            count: createdKycs.length,
            kycIds: createdKycs
        });

    } catch (err) {
        console.error("KYC Submission Error:", err);
        res.status(500).json({ message: "Internal Server Error during KYC submission" });
    }
};

exports.listMyKyc = async (req, res) => {
    try {
        
        const filter = {
            userId: req.user.id
        };

        // optional status filter (same as getAllKyc)
        if (req.query.status) {
            filter.kycStatus = req.query.status;
        }
        
        const kycs = await Kyc.find(filter)
            .populate("userId", "phone")
            .populate("verifiedBy", "name")
            .sort({ createdAt: -1 });

        return res.json({
            status: 200,
            message: "ok",
            data: kycs
        });

    } catch (err) {
        console.error("listMyKyc error:", err);
        return res.status(500).json({
            status: 500,
            message: "Something went wrong"
        });
    }
};

exports.getAllKyc = async (req, res) => {
    const filter = {};

    if (req.query.status) {
        filter.kycStatus = req.query.status;
    }

    const kycs = await Kyc.find(filter)
        .populate("userId", "phone")
        .populate("verifiedBy", "name")
        .sort({ createdAt: -1 });

    res.json(kycs);
};

exports.getPendingKyc = async (req, res) => {
    try {
        const pendingKycs = await Kyc.find({
            $or: [
                { kycStatus: "PENDING" },
                { verifiedByOfficer: false }
            ]
        })
            .populate("userId", "name phone")
            .sort({ createdAt: -1 });

        res.json(pendingKycs);
    } catch (error) {
        console.error("Error fetching pending KYC:", error);
        res.status(500).json({
            message: "Error fetching pending KYC"
        });
    }
};

exports.updateKycStatus = async (req, res) => {
    try {
        const { kycId } = req.params;
        const { status, remark } = req.body;

        if (!["VERIFIED", "REJECTED"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const update = {
            kycStatus: status,
            verifiedByOfficer: status === "VERIFIED",
            verifiedAt: new Date(),
            offlineNote: remark || ""
        };

        const kyc = await Kyc.findByIdAndUpdate(kycId, update, { new: true });

        if (!kyc) {
            return res.status(404).json({ message: "KYC not found" });
        }

        res.json({
            message: `KYC ${status.toLowerCase()} successfully`,
            kyc
        });
    } catch (error) {
        console.error("Update KYC error:", error);
        res.status(500).json({ message: "Failed to update KYC status" });
    }
};

// controllers/kyc.controller.js
exports.getMyKycStatus = async (req, res) => {
    try {
        // 🛑 ADMIN BYPASS
        if (req.user.role === "ADMIN") {
            return res.json({
                status: "APPROVED",
                role: "ADMIN"
            });
        }

        const records = await Kyc.find({ userId: req.user.id });

        if (records.length === 0) {
            return res.json({
                status: "NOT_SUBMITTED",
                role: req.user.role
            });
        }

        if (records.some(k => k.kycStatus === "REJECTED")) {
            return res.json({
                status: "REJECTED",
                role: req.user.role
            });
        }

        if (records.some(k => k.kycStatus === "PENDING")) {
            return res.json({
                status: "PENDING",
                role: req.user.role
            });
        }

        return res.json({
            status: "APPROVED",
            role: req.user.role
        });

    } catch (error) {
        console.error("getMyKycStatus error:", error);
        res.status(500).json({ message: "Failed to get KYC status" });
    }
};