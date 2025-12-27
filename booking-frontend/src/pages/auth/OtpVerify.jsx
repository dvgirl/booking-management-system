import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp } from "../../api/auth.api";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { FiShield, FiEdit2, FiLock, FiArrowLeft } from "react-icons/fi";

export default function OtpVerify() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      login(res.data);

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
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] p-4 font-sans">
      {/* Decorative Background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-100 rounded-full blur-[100px] opacity-40" />
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 lg:p-12 backdrop-blur-sm bg-white/90">
          
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-2xl text-white mb-6 shadow-xl shadow-emerald-100 ring-4 ring-emerald-50">
              <FiShield size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none uppercase">
              Verify Identity
            </h1>
            <div className="flex items-center justify-center gap-2 mt-4 py-2 px-4 bg-slate-50 rounded-full border border-slate-100 w-fit mx-auto">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Code sent to</span>
              <span className="text-[12px] font-black text-slate-700">{state.phone}</span>
              <button 
                onClick={() => navigate("/login")}
                className="text-blue-500 hover:text-blue-700 transition-colors ml-1"
                title="Change Phone Number"
              >
                <FiEdit2 size={14} />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[13px] font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {error}
            </div>
          )}

          {/* OTP Input Field */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                Security Code
              </label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300">
                  <FiLock size={20} />
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="0 0 0 0 0 0"
                  maxLength={6}
                  className="w-full pl-14 pr-4 py-5 text-2xl font-black tracking-[0.4em] text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-200 text-center"
                />
              </div>
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:bg-emerald-600 hover:shadow-2xl hover:shadow-emerald-200 disabled:opacity-70 active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Verifying...</span>
                </div>
              ) : (
                "COMPLETE AUTHORIZATION"
              )}
            </button>
          </div>

          {/* Resend Logic / Help */}
          <p className="text-center mt-8 text-slate-400 text-xs font-medium">
            Didn't receive the code? <button className="text-blue-600 font-bold hover:underline">Resend OTP</button>
          </p>
        </div>

        {/* Back Button */}
        <button 
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 mx-auto mt-8 text-slate-500 hover:text-slate-800 transition-colors font-bold text-xs uppercase tracking-widest"
        >
          <FiArrowLeft strokeWidth={3} />
          Go back to login
        </button>
      </div>
    </div>
  );
}