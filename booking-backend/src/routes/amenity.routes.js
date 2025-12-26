const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const virtualAccAuth = require("../middleware/virtualAccAuth");
const { addAmenity, listAmenities } = require("../controllers/amenity.controller");


router.post("/", virtualAccAuth, role("ADMIN" ,"SUPER_ADMIN"), addAmenity);
router.get("/", auth, role("ADMIN" ,"SUPER_ADMIN"), listAmenities);

module.exports = router;
