const cron = require("node-cron");
const generate = require("../controllers/report.controller");

cron.schedule("59 23 * * *", () => {
  console.log("Generating daily report...");
});
