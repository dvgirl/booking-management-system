import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp } from "../../api/auth.api";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { FiShield, FiEdit2 } from "react-icons/fi";

export default function OtpVerify() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-fill OTP (dev mode)
  useEffect(() => {
    if (state?.autoFillOtp) {
      setOtp(state.autoFillOtp.toString());
    }
  }, [state]);

  if (!state) {
    navigate("/login");
    return null;
  }

  const handleVerify = async () => {
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await verifyOtp({
        phone: state.phone,
        otp
      });

      const { user, kycStatus, isNewUser } = res.data;

      // Save auth
      login(res.data);

      // 🔀 Navigation logic
      if (user.role === "ADMIN") {
        navigate("/dashboard");
        return;
      }

      if (isNewUser) {
        navigate("/kyc");
        return;
      }

      if (kycStatus === "PENDING") {
        navigate("/kyc/pending");
      } else if (kycStatus === "REJECTED") {
        navigate("/kyc/rejected");
      } else if (kycStatus === "VERIFIED") {
        navigate("/bookings/calendar");
      } else {
        navigate("/kyc");
      }

    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8">
        
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-emerald-500 rounded-3xl text-white mb-4">
            <FiShield size={24} />
          </div>
          <h1 className="text-2xl font-black text-slate-900">OTP Verification</h1>
          <p className="text-xs text-slate-500 mt-1">
            Sent to <b>{state.phone}</b>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Enter OTP"
          maxLength={6}
          className="w-full py-4 text-center text-2xl tracking-widest rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full mt-6 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-emerald-600 transition"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <button
          onClick={() => navigate("/login")}
          className="w-full mt-4 text-sm text-gray-500 hover:text-blue-600"
        >
          Change phone number
        </button>
      </div>
    </div>
  );
}
