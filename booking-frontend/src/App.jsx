import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";

// Auth Pages
import Login from "./pages/auth/Login";
import OtpVerify from "./pages/auth/OtpVerify";
import KycForm from "./pages/auth/KycForm";
import KycPending from "./pages/auth/KycPending";
import KycRejected from "./pages/auth/KycRejected";
import AdminKyc from "./pages/admin/AdminKyc";
import KycGuard from "./components/guards/KycGuard";
import ProtectedRoute from "./components/guards/ProtectedRoute.jsx";
import Profile from "./pages/profile/Profile";
import AdminBookingList from "./pages/admin/AdminBookingList";
import AdminBookingDetail from "./pages/admin/AdminBookingDetail";

// Dashboard
import Dashboard from "./pages/dashboard/Dashboard";

// Bookings
import BookingCalendar from "./pages/bookings/BookingCalendar";
import BookingList from "./pages/inventory/BookingList";
import BookingEdit from "./pages/inventory/BookingEdit";

// Inventory
import InventoryCalendar from "./pages/inventory/InventoryCalendar";

// Check-in
import CheckInSearch from "./pages/checkin/CheckInSearch";
import CheckInDetails from "./pages/checkin/CheckInDetails";
import CheckInHistory from "./pages/checkin/CheckInHistory";
import CheckInUpload from "./pages/checkin/CheckInUpload";

// Finance
import PaymentEntry from "./pages/finance/PaymentEntry";
import RefundEntry from "./pages/finance/RefundEntry";
import TransactionList from "./pages/finance/TransactionList";
import TransactionDetail from "./pages/finance/TransactionDetail";
import Reconciliation from "./pages/finance/Reconciliation";

// Process/Tasks
import ProcessCreate from "./pages/process/ProcessCreate";
import ProcessList from "./pages/process/ProcessList";
import ProcessDashboard from "./pages/process/ProcessDashboard";
import ProcessDetail from "./pages/process/ProcessDetail";
import ProcessUpdate from "./pages/process/ProcessUpdate";

// Reports
import DailyReportList from "./pages/DailyReport/DailyReportList";
import DailyReportView from "./pages/DailyReport/DailyReportView";
import DailyReportSubmit from "./pages/DailyReport/DailyReportSubmit";
import SuperAdminReportView from "./pages/DailyReport/SuperAdminReportView";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import RoomsManager from "./pages/admin/RoomsManager";
import AmenitiesManager from "./pages/admin/AmenitiesManager";
import FacilityBlocking from "./pages/admin/FacilityBlocking";
import VirtualAccounts from "./pages/admin/VirtualAccounts";

// Documents
import DocumentList from "./pages/documents/DocumentList";
import DocumentGenerate from "./pages/documents/DocumentGenerate";
import DocumentPreview from "./pages/documents/DocumentPreview";
import MasterDocumentVault from "./pages/documents/MasterDocumentVault";

import PendingKyc from "./pages/kyc/PendingKyc";
import MyKyc from "./pages/user/Mykyc.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<OtpVerify />} />
        <Route path="/profile" element={<Profile />} />
        {/* PROTECTED ROUTES */}
        <Route element={<MainLayout />}>
          {/* Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <Dashboard />
            }
          />

          {/* Bookings */}
          <Route
            path="/bookings/calendar"
            element={
              <KycGuard allow="APPROVED">
                <BookingCalendar />
              </KycGuard>
            }
          />
          <Route path="/bookings/list" element={<BookingList />} />
          <Route path="/bookings/:id/edit" element={<BookingEdit />} />

          {/* Inventory */}
          <Route path="/inventory/calendar" element={<InventoryCalendar />} />

          {/* Check-in */}
          <Route path="/checkin/search" element={<CheckInSearch />} />
          <Route path="/checkin/details" element={<CheckInDetails />} />
          <Route path="/checkin/history" element={<CheckInHistory />} />

          <Route path="/checkin/upload" element={<CheckInUpload />} />

          {/* KYC */}
          <Route path="/kyc" element={<KycGuard allow="NOT_SUBMITTED"><KycForm /></KycGuard>} />
          <Route path="/kyc/pending" element={<KycGuard allow="PENDING"><KycPending /></KycGuard>} />
          <Route path="/kyc/rejected" element={<KycGuard allow="REJECTED"><KycRejected /></KycGuard>} />

          <Route path="/pendnig-kyc" element={<PendingKyc />} />
          <Route path="/admin/kyc" element={<AdminKyc />} />
          <Route path="/bookings" element={<KycGuard allow="APPROVED"><AdminBookingList /></KycGuard>} />
          <Route path="/bookings/:id" element={<AdminBookingDetail />} />
          <Route path="/kyc-list" element={<MyKyc />} />


          {/* Finance */}
          <Route path="/finance/pay" element={<PaymentEntry />} />
          <Route path="/finance/refund" element={<RefundEntry />} />
          <Route path="/finance/list" element={<TransactionList />} />
          <Route path="/finance/:id" element={<TransactionDetail />} />
          <Route path="/finance/reconciliation" element={<Reconciliation />} />

          {/* Process/Tasks */}
          <Route path="/process/create" element={<ProcessCreate />} />
          <Route path="/process/list" element={<ProcessList />} />
          <Route path="/process/dashboard" element={<ProcessDashboard />} />
          <Route path="/process/:id" element={<ProcessDetail />} />
          <Route path="/process/:id/update" element={<ProcessUpdate />} />

          {/* Reports */}
          <Route path="/reports/list" element={<DailyReportList />} />
          <Route path="/reports/submit" element={<DailyReportSubmit />} />
          <Route path="/reports/:date" element={<DailyReportView />} />
          <Route path="/reports/super-admin/:date" element={<SuperAdminReportView />} />

          {/* Admin */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/rooms" element={<RoomsManager />} />
          <Route path="/admin/amenities" element={<AmenitiesManager />} />
          <Route path="/admin/facilities" element={<FacilityBlocking />} />
          <Route path="/admin/virtual-accounts" element={<VirtualAccounts />} />

          {/* Documents */}
          <Route path="/documents" element={<MasterDocumentVault />} />
          <Route path="/documents/list" element={<DocumentList />} />
          <Route path="/documents/generate" element={<DocumentGenerate />} />
          <Route path="/documents/:id/preview" element={<DocumentPreview />} />

          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
