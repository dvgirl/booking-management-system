const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const upload = require("../middleware/upload.refund");

const {
    initiateRefund,
    uploadRefundProof,
    verifyRefund,
    lockRefund
} = require("../controllers/refund.controller");

router.post(
    "/initiate",
    auth,
    role("ADMIN", "SUPER_ADMIN"),
    initiateRefund
);

router.post(
    "/proof/:id",
    auth,
    upload.single("file"),
    uploadRefundProof
);

router.patch(
    "/verify/:id",
    auth,
    role("ADMIN", "SUPER_ADMIN"),
    verifyRefund
);

router.patch(
    "/lock/:id",
    auth,
    role("SUPER_ADMIN"),
    lockRefund
);

module.exports = router;
