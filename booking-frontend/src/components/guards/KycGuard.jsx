import { useEffect, useState } from "react";
import { getMyKycStatus } from "../../api/kyc.api";
import { Navigate } from "react-router-dom";

export default function KycGuard({ allow, children }) {
  const [status, setStatus] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyKycStatus()
      .then(res => {
        setStatus(res.data.status);
        setRole(res.data.role);
      })
      .catch(() => {
        setStatus("NOT_SUBMITTED");
        setRole("USER");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Checking access...</div>;

  // ✅ Admin always allowed
  if (role === "ADMIN") return children;

  // ✅ FIX: Allow rendering if status matches OR if it's a re-submission case
  // If the page expects "NOT_SUBMITTED" (the form), also allow "REJECTED" users to see it
  if (allow === status || (allow === "NOT_SUBMITTED" && status === "REJECTED")) {
    return children;
  }

  // 🔁 Redirect rules
  if (status === "APPROVED") return <Navigate to="/bookings/calendar" replace />;
  if (status === "PENDING") return <Navigate to="/kyc/pending" replace />;
  
  // Notice: We removed the REJECTED redirect from here if it's not the current allowed state
  // to prevent the infinite loop when trying to go to the /kyc form.
  if (status === "REJECTED" && allow !== "REJECTED") {
     return <Navigate to="/kyc/rejected" replace />;
  }

  // Default
  return <Navigate to="/kyc" replace />;
}