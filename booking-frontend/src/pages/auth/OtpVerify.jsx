import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp } from "../../api/auth.api";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { FiShield, FiEdit2, FiLock, FiArrowLeft, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

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

  // Redirect if accessed directly without state
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

      login(res.data); // Update AuthContext

      if (user.role === "ADMIN") {
        navigate("/dashboard");
        return;
      }

      if (isNewUser) {
        navigate("/kyc");
        return;
      }

      // Existing Routing Logic
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans relative overflow-hidden">
      {/* Ambient Background Elements - Consistent with Login */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[100px] mix-blend-multiply opacity-70 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/60 rounded-full blur-[100px] mix-blend-multiply opacity-70" />
      </div>

      <div className="w-full max-w-md z-10 p-4">
        {/* Back Navigation */}
        <button 
          onClick={() => navigate("/login")}
          className="group flex items-center gap-2 mb-6 text-slate-500 hover:text-slate-800 transition-colors font-bold text-xs uppercase tracking-widest pl-2"
        >
          <FiArrowLeft strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </button>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-8 sm:p-10 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white mb-6 shadow-lg shadow-emerald-200 transform hover:scale-105 transition-transform duration-300">
              <FiShield size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
              Verify Identity
            </h1>
            
            {/* Phone Number Display */}
            <div className="flex items-center justify-center gap-2 mt-3 py-1.5 px-3 bg-slate-100/80 rounded-full border border-slate-200/60 w-fit mx-auto">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sent to</span>
              <span className="text-xs font-black text-slate-700 font-mono tracking-wide">{state.phone}</span>
              <button 
                onClick={() => navigate("/login")}
                className="ml-1 p-1 hover:bg-white rounded-full text-slate-400 hover:text-blue-600 transition-all shadow-sm"
                title="Change Phone Number"
              >
                <FiEdit2 size={10} />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-fade-in-down">
              <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
              <p className="text-sm text-red-600 font-medium leading-tight">{error}</p>
            </div>
          )}

          {/* OTP Input Section */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">
                Enter Security Code
              </label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors duration-200">
                  <FiLock size={20} strokeWidth={2} />
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="• • • • • •"
                  maxLength={6}
                  className="w-full pl-14 pr-4 py-4 text-2xl font-bold tracking-[0.5em] text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-300 text-center font-mono"
                />
                {otp.length === 6 && (
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in spin-in-180 duration-300">
                        <FiCheckCircle size={20} />
                    </div>
                )}
              </div>
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={loading}
              className="group w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-200 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <span>COMPLETE VERIFICATION</span>
                  <FiShield className="group-hover:scale-110 transition-transform duration-200" size={16} />
                </>
              )}
            </button>
          </div>

          {/* Resend Link */}
          <div className="mt-8 text-center">
            <p className="text-slate-400 text-xs font-medium">
              Didn't receive the code?{' '}
              <button className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline transition-colors focus:outline-none">
                Resend OTP
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center opacity-60">
            <div className="flex items-center justify-center gap-2 text-slate-400">
                <FiLock size={12} />
                <span className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encrypted</span>
            </div>
        </div>
      </div>
    </div>
  );
} 