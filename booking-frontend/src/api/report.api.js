import api from "./axios";

// 1. Fetch all reports for the list view
export const getDailyReports = () =>
    api.get("/reports/daily");

// 2. Fetch a specific report by date (YYYY-MM-DD)  
export const getDailyReport = (date) =>
    api.get(`/reports/${date}`);

// 3. Trigger the generation of a new report (for today)
export const generateDailyReport = () =>
    api.post("/reports/generate");

// 4. Dashboard Statistics
export const getDashboardStats = () =>
    api.get("/reports/dashboard/stats");

// 5. Recent Activity Feed
export const getRecentActivity = (limit = 10) =>
    api.get("/reports/dashboard/activity", { params: { limit } });

// 6. Submit/Verify a report (if your schema supports a submit action)
export const submitDailyReport = (data) =>
    api.post("/reports/daily/submit", data);

// 7. Lock a report (Prevent further changes)
export const lockReport = (id) =>
    api.patch(`/reports/daily/${id}/lock`);

