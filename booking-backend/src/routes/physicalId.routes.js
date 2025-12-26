const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const {
    collectPhysicalId,
    listActiveIds,
    returnPhysicalId,
    markLost
} = require("../controllers/physicalId.controller");

router.post(
    "/collect/:bookingId",
    auth,
    role("ADMIN", "SUPER_ADMIN"),
    collectPhysicalId
);

router.get(
    "/active",
    auth,
    role("ADMIN", "SUPER_ADMIN"),
    listActiveIds
);

router.patch(
    "/return/:id",
    auth,
    role("ADMIN", "SUPER_ADMIN"),
    returnPhysicalId
);

router.patch(
    "/lost/:id",
    auth,
    role("SUPER_ADMIN"),
    markLost
);

module.exports = router;
