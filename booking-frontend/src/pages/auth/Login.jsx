import { useState, useContext } from "react";
import { sendOtp, googleLoginApi } from "../../api/auth.api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { FiPhone, FiArrowRight, FiShield } from "react-icons/fi";
import { GoogleLogin } from "@react-oauth/google";

export default function Login() {
    const [phone, setPhone] = useState("");
    const [aadhaar, setAadhaar] = useState("");
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
            const res = await googleLoginApi({ token: credentialResponse.credential });
            const { user, kycStatus, isNewUser } = res.data;

            login(res.data); // Update AuthContext

            if (user.role === "ADMIN") return navigate("/dashboard");
            if (isNewUser) return navigate("/kyc");

            // KYC Route Logic
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
        <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] p-4 font-sans">
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-50" />
            </div>

            <div className="w-full max-w-md">
                <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 lg:p-12 backdrop-blur-sm bg-white/90">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white mb-6 shadow-xl shadow-blue-200 ring-4 ring-blue-50">
                            <span className="text-3xl">🏨</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">WELCOME BACK</h1>
                        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] mt-3">Secure Guest Access</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[13px] font-semibold flex items-center gap-3">
                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500">
                                    <FiPhone size={18} />
                                </div>
                                <input
                                    type="tel"
                                    placeholder="Enter 10 digits"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-semibold text-slate-700"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSendOtp}
                            disabled={loading}
                            className="group relative w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:bg-blue-600 disabled:opacity-70 active:scale-[0.98]"
                        >
                            {loading ? "Processing..." : "SEND VERIFICATION CODE"}
                            {!loading && <FiArrowRight className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />}
                        </button>

                        {/* Divider */}
                        <div className="relative flex py-3 items-center">
                            <div className="flex-grow border-t border-slate-100"></div>
                            <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-black">OR</span>
                            <div className="flex-grow border-t border-slate-100"></div>
                        </div>

                        {/* Google Button - Preserving UI flow */}
                        <div className="flex justify-center w-full">
                            <div className="w-full scale-105"> 
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => setError("Google Login Failed")}
                                    theme="outline"
                                    shape="pill"
                                    width="320px"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
                        <FiShield className="text-blue-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">End-to-end encrypted</span>
                    </div>
                </div>
            </div>
        </div>
    );
}