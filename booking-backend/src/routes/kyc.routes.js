const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

const {
  uploadKyc,
  listMyKyc,
  getAllKyc,
  verifyKyc,
  submitKyc,
  getPendingKyc,
  updateKycStatus,
  getMyKycStatus
} = require("../controllers/kyc.controller");

router.post("/upload", auth, upload.single("document"), uploadKyc);
router.get("/my", auth, listMyKyc);
router.patch(
  "/verify/:kycId",
  auth,
  role("ADMIN", "SUPER_ADMIN"),
  verifyKyc
);

router.post(
  "/submit",
  auth,
  upload.fields([
    { name: "selfAadhaar", maxCount: 1 },
    { name: "spouseAadhaar", maxCount: 1 },
    { name: "childrenAadhaar", maxCount: 5 }
  ]),
  submitKyc
);

router.patch(
  "/status/:kycId",
  auth,
  role("ADMIN", "SUPER_ADMIN"),
  updateKycStatus
);

router.get(
  "/pending",
  auth,
  role("ADMIN", "SUPER_ADMIN"),
  getPendingKyc
);

router.get(
  "/all",
  auth,
  role("ADMIN", "SUPER_ADMIN"),
  getAllKyc
);

router.get("/my-status", auth, getMyKycStatus);

module.exports = router;
