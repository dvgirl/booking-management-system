const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const upload = require("../middleware/upload.scanned");

const {
  uploadScannedDoc,
  lockDocument,
  getDocumentsByDate,
  getBookingDocuments
} = require("../controllers/scannedDocument.controller");

router.post(
  "/upload",
  auth,
  role("ADMIN", "SUPER_ADMIN"),
  upload.single("file"),
  uploadScannedDoc
);

router.patch(
  "/lock/:id",
  auth,
  role("SUPER_ADMIN"),
  lockDocument
);

router.get(
  "/date/:date",
  auth,
  role("SUPER_ADMIN"),
  getDocumentsByDate
);

router.get(
  "/booking/:bookingId",
  auth,
  role("ADMIN", "SUPER_ADMIN"),
  getBookingDocuments
);

module.exports = router;
