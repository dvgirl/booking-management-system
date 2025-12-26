const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");

const {
  generateDailyReport,
  getDailyReport, // Single report by date
  getDailyReports, // Add this to your controller imports if not there
  getDashboardStats,
  getRecentActivity
} = require("../controllers/report.controller");

// 1. DASHBOARD ROUTES (Specific paths first)
router.get(
  "/dashboard/stats",
  auth,
  getDashboardStats
);

router.get(
  "/dashboard/activity",
  auth,
  getRecentActivity
);

/**
 * ================= DAILY REPORT LIST =================
 */
router.get(
  "/daily",
  auth,
  role("SUPER_ADMIN", "ADMIN"),
  getDailyReports
);

/**
 * ================= GENERATE REPORT =================
 */
router.post(
  "/generate",
  auth,
  role("SUPER_ADMIN", "ADMIN"),
  generateDailyReport
);

/**
 * ================= SINGLE REPORT BY DATE =================
 * KEEP THIS LAST
 */
router.get(
  "/:date",
  auth,
  role("SUPER_ADMIN", "ADMIN"),
  getDailyReport
);

module.exports = router;