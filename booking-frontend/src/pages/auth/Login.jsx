import { useState } from "react";
import { sendOtp } from "../../api/auth.api";
import { useNavigate } from "react-router-dom";
import { FiPhone, FiCreditCard, FiArrowRight, FiShield } from "react-icons/fi";

export default function Login() {
    const [phone, setPhone] = useState("");
    const [aadhaar, setAadhaar] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSendOtp = async () => {
        setError("");

        if (!phone || phone.length !== 10) {
            setError("Please enter a valid 10-digit phone number");
            return;
        }

        setLoading(true);
        try {
            // 1. Call API and capture the response containing the OTP
            const res = await sendOtp({ phone, aadhaar });

            // 2. Pass phone, aadhaar, and autoFillOtp to the verify page
            navigate("/verify-otp", {
                state: {
                    phone,
                    aadhaar,
                    autoFillOtp: res.data.otp 
                }
            });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] p-4 font-sans">
            {/* Background decorative elements */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-50" />
            </div>

            <div className="w-full max-w-md">
                <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 lg:p-12 backdrop-blur-sm bg-white/90">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl text-white mb-6 shadow-xl shadow-blue-200 ring-4 ring-blue-50">
                            <span className="text-3xl">🏨</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
                            WELCOME BACK
                        </h1>
                        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] mt-3">
                            Secure Guest Access
                        </p>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[13px] font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-5">
                        {/* Phone Input */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                Phone Number
                            </label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                    <FiPhone size={18} />
                                </div>
                                <input
                                    type="tel"
                                    placeholder="Enter 10 digits"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                />
                            </div>
                        </div>

                        {/* Aadhaar Input (Optional/Added based on your API logic) */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                                Aadhaar Number (Optional)
                            </label>
                            {/* <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                    <FiCreditCard size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="XXXX-XXXX-XXXX"
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all font-semibold text-slate-700 placeholder:text-slate-300"
                                    value={aadhaar}
                                    onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))}
                                />
                            </div> */}
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSendOtp}
                            disabled={loading}
                            className="group relative w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 overflow-hidden transition-all hover:bg-blue-600 hover:shadow-2xl hover:shadow-blue-200 disabled:opacity-70 active:scale-[0.98]"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                <>
                                    <span>SEND VERIFICATION CODE</span>
                                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
                        <FiShield className="text-blue-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">End-to-end encrypted</span>
                    </div>
                </div>
                
                <p className="text-center mt-8 text-slate-400 text-xs font-medium">
                    Need help? <button className="text-blue-600 font-bold hover:underline">Contact Support</button>
                </p>
            </div>
        </div>
    );
}