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
        const userId =
            req.user?._id ||
            req.user?.id ||
            req.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const { self, spouse, children, bookingId } = req.body;
        const createdKycs = [];

        if (self && req.files?.selfAadhaar?.[0]) {
            const data = JSON.parse(self);

            const kyc = await Kyc.create({
                userId,
                type: "SELF",
                fullName: data.name,
                aadhaarLast4: data.aadhaarLast4 || "0000",
                documentUrl: req.files.selfAadhaar[0].path
            });

            createdKycs.push(kyc._id);
        }

        if (spouse && req.files?.spouseAadhaar?.[0]) {
            const data = JSON.parse(spouse);

            const kyc = await Kyc.create({
                userId,
                type: "SPOUSE",
                fullName: data.name,
                aadhaarLast4: data.aadhaarLast4 || "0000",
                documentUrl: req.files.spouseAadhaar[0].path
            });

            createdKycs.push(kyc._id);
        }

        if (children && req.files?.childrenAadhaar) {
            const kids = JSON.parse(children);

            for (let i = 0; i < kids.length; i++) {
                if (!req.files.childrenAadhaar[i]) continue;

                const kyc = await Kyc.create({
                    userId,
                    type: "CHILD",
                    fullName: kids[i].name,
                    aadhaarLast4: kids[i].aadhaarLast4 || "0000",
                    documentUrl: req.files.childrenAadhaar[i].path
                });

                createdKycs.push(kyc._id);
            }
        }

        if (bookingId && createdKycs.length) {
            await Booking.findByIdAndUpdate(
                bookingId,
                { $addToSet: { kycIds: { $each: createdKycs } } }
            );
        }

        res.json({ message: "KYC submitted successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "KYC submission failed" });
    }
};

exports.listMyKyc = async (req, res) => {
    try {
        console.log("req.user.id" , req.user.id)
        const filter = {
            userId: req.user.id
        };

        // optional status filter (same as getAllKyc)
        if (req.query.status) {
            filter.kycStatus = req.query.status;
        }
        console.log("filter" , filter)
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