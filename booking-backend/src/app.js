require("dotenv").config();   // 👈 MUST BE FIRST

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());


app.use("/uploads/kyc", express.static("uploads/kyc"));
app.use("/uploads/admin/refunds", express.static("uploads/admin/refunds"));
app.use("/uploads/admin/scanned", express.static("uploads/admin/scanned"));
app.use("/uploads/manual", express.static("uploads/manual"));
app.use("/uploads/offline", express.static("uploads/offline"));
app.use("/uploads/online/kyc", express.static("uploads/online/kyc"));
app.use("/uploads/online/user", express.static("uploads/online/user"));
app.use("/uploads/system/generated", express.static("uploads/system/generated"));

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/bookings", require("./routes/booking.routes"));
app.use("/api/rooms", require("./routes/room.routes"));
app.use("/api/admin/amenities", require("./routes/amenity.routes"));
app.use("/api/kyc", require("./routes/kyc.routes"));
app.use("/api/refunds", require("./routes/refund.routes"));
app.use("/api/transactions", require("./routes/transaction.routes"));
app.use("/api/documents", require("./routes/document.routes"));
app.use("/api/document-tracker", require("./routes/documentTracker.routes"));
app.use("/api/physical-id", require("./routes/physicalId.routes"));
app.use("/api/scanned-documents", require("./routes/scannedDocument.routes"));
app.use("/api/inventory", require("./routes/inventory.routes"));
app.use("/api/admin/facility-block", require("./routes/facilityBlock.routes"));
app.use("/api/reports/", require("./routes/report.routes"));
app.use("/api/process", require("./routes/process.routes"));
app.use("/api/admin/virtual-accounts", require("./routes/virtualAccount.routes"));

app.use(express.static(path.join(__dirname, "../booking-frontend/dist")));

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.url.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, "../booking-frontend/dist/index.html"));
  }
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});


// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
