const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const {
    createProcess,
    assignProcess,
    updateStatus,
    closeProcess,
    getProcessStats,
    getProcessList,
    getProcessDetails
} = require("../controllers/process.controller");

router.get("/dashboard", auth, getProcessStats);
router.post("/", auth, createProcess);
router.get("/", auth, getProcessList);
router.get("/:id", auth, getProcessDetails);
router.patch("/assign/:id", auth, assignProcess);
router.put("/:id", auth, updateStatus);
router.patch("/close/:id", auth, closeProcess);


module.exports = router;
