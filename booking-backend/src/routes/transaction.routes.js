const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const upload = require("../middleware/upload.payment");

const {
    createTransaction,
    uploadProof,
    verifyTransaction,
    lockTransaction,
    listTransactions,
    initiateBookingWithPayment,
    verifyCashfreePayment
} = require("../controllers/transaction.controller");

router.post("/create", auth, createTransaction);

router.post(
    "/proof/:id",
    auth,
    upload.single("file"),
    uploadProof
);

router.patch(
    "/verify/:id",
    auth,
    role("ADMIN", "SUPER_ADMIN"),
    verifyTransaction
);

router.patch(
    "/lock/:id",
    auth,
    role("SUPER_ADMIN"),
    lockTransaction
);

router.get("/", auth, listTransactions);

router.post("/initiateCashfreePayment", auth, initiateBookingWithPayment)

router.post("/verifyCashfreePayment", auth, verifyCashfreePayment)

module.exports = router;
