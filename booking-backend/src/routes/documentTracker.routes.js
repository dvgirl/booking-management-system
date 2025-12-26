const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

const {
    uploadDocument,
    verifyDocument,
    lockDocument,
    listDocuments,
    getDocumentById
} = require("../controllers/documentTracker.controller");


router.get(
    "/list",
    auth,
    listDocuments
);

router.get("/:id", auth, getDocumentById);

router.post(
    "/upload",
    auth,
    upload.single("file"),
    uploadDocument
);

router.patch(
    "/verify/:id",
    auth,
    role("ADMIN", "SUPER_ADMIN"),
    verifyDocument
);

router.patch(
    "/lock/:id",
    auth,
    role("SUPER_ADMIN"),
    lockDocument
);





module.exports = router;
