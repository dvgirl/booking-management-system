import { useEffect, useState, useContext } from "react";
import { getMyKycStatus } from "../../api/kyc.api";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext"; 

export default function KycGuard({ allow, children }) {
  const { user, updateKycStatus } = useContext(AuthContext); 
  const [status, setStatus] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyKycStatus()
      .then(res => {
        const data = res?.data || res;
        const fetchedStatus = data.status;
        const fetchedRole = data.role;

        setStatus(fetchedStatus);
        setRole(fetchedRole);
        
        // Sync with AuthContext so Sidebar updates
        if (updateKycStatus && user?.kycStatus !== fetchedStatus) {
            updateKycStatus(fetchedStatus);
        }
      })
      .catch(() => {
        setStatus("NOT_SUBMITTED");
        setRole("USER");
      })
      .finally(() => setLoading(false));
  }, [updateKycStatus, user?.kycStatus]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="text-blue-500 font-bold animate-pulse uppercase tracking-widest text-xs">
        Verifying Security Clearance...
      </div>
    </div>
  );

  // 1. Admin Bypass
  if (role === "ADMIN" || role === "SUPER_ADMIN") return children;

  // 2. SUCCESS: If user status matches the 'allow' prop, show the page
  // (e.g., allow="APPROVED" and status is "APPROVED")
  if (allow === status || (allow === "NOT_SUBMITTED" && status === "REJECTED")) {
    return children;
  }

  // 3. REDIRECTS: Only redirect if the user is NOT on the correct page
  if (status === "APPROVED" && allow !== "APPROVED") {
    return <Navigate to="/bookings/calendar" replace />;
  }
  
  if (status === "PENDING" && allow !== "PENDING") {
    return <Navigate to="/kyc/pending" replace />;
  }
  
  if (status === "REJECTED" && allow !== "REJECTED") {
    return <Navigate to="/kyc/rejected" replace />;
  }

  if (status === "NOT_SUBMITTED" && allow !== "NOT_SUBMITTED") {
    return <Navigate to="/kyc" replace />;
  }

  // Fallback
  return children;
}