const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const { blockFacility } = require("../controllers/facilityBlock.controller");

router.post("/", auth, role("ADMIN"), blockFacility);

module.exports = router;
