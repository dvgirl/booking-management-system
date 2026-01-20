import { useState, useContext } from "react";
import { sendOtp, googleLoginApi } from "../../api/auth.api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { FiPhone, FiArrowRight, FiShield, FiAlertCircle, FiLock } from "react-icons/fi";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
    // Preserve existing state and logic exactly
    const [phone, setPhone] = useState("");
    const [aadhaar, setAadhaar] = useState(""); // Kept to maintain signature of sendOtp({ phone, aadhaar })
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleSendOtp = async () => {
        setError("");
        if (!phone || phone.length !== 10) {
            setError("Please enter a valid 10-digit phone number");
            return;
        }

        setLoading(true);
        try {
            // Existing logic maintained
            const res = await sendOtp({ phone, aadhaar });
            navigate("/verify-otp", {
                state: { phone, aadhaar, autoFillOtp: res.data.otp }
            });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError("");
        try {
            // Existing logic maintained
            const res = await googleLoginApi({ token: credentialResponse.credential });
            const { user, kycStatus, isNewUser } = res.data;

            login(res.data); 

            if (user.role === "ADMIN") return navigate("/dashboard");
            if (isNewUser) return navigate("/kyc");

            if (kycStatus === "PENDING") navigate("/kyc/pending");
            else if (kycStatus === "REJECTED") navigate("/kyc/rejected");
            else if (kycStatus === "VERIFIED") navigate("/bookings/calendar");
            else navigate("/kyc");

        } catch (err) {
            setError("Google sign-in failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans relative overflow-hidden">
            {/* Ambient Background Elements - Enhanced for modern look */}
            <div className="absolute inset-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px] mix-blend-multiply opacity-70 animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100/60 rounded-full blur-[100px] mix-blend-multiply opacity-70" />
                <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-100/50 rounded-full blur-[120px] -z-10" />
            </div>

            <div className="w-full max-w-md z-10 p-4">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 p-8 sm:p-10 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                    
                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl text-white mb-6 shadow-lg shadow-indigo-200 transform rotate-3 hover:rotate-6 transition-transform duration-300">
                            <FiLock className="text-2xl" strokeWidth={2.5} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Welcome Back</h1>
                        <p className="text-slate-500 text-sm font-medium">Access your booking dashboard securely</p>
                    </div>

                    {/* Error Notification */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 animate-fade-in-down">
                            <FiAlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
                            <p className="text-sm text-red-600 font-medium leading-tight">{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Phone Input */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">
                                Phone Number
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-200">
                                    <FiPhone size={18} strokeWidth={2} />
                                </div>
                                <input
                                    type="tel"
                                    placeholder="Enter 10-digit number"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSendOtp}
                            disabled={loading}
                            className="group w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-200 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Sending Code...</span>
                                </>
                            ) : (
                                <>
                                    <span>GET VERIFICATION CODE</span>
                                    <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-200" strokeWidth={2.5} />
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-slate-200"></div>
                            <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold uppercase tracking-widest">or continue with</span>
                            <div className="flex-grow border-t border-slate-200"></div>
                        </div>

                        {/* Google Login Wrapper */}
                        <div className="flex justify-center w-full">
                            <div className="w-full"> 
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => setError("Google Login Failed")}
                                    theme="outline"
                                    size="large"
                                    shape="circle"
                                    width="100%"
                                    text="continue_with"
                                    locale="en"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer / Trust Badge */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <div className="flex items-center justify-center gap-2 text-slate-400">
                            <FiShield className="text-emerald-500" size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Bank-grade Security</span>
                        </div>
                    </div>
                </div>
                
                <div className="mt-8 text-center">
                    <p className="text-slate-400 text-xs font-medium">
                        &copy; {new Date().getFullYear()} Booking Management System
                    </p>
                </div>
            </div>
        </div>
    );
}