import { useState } from "react";
import { sendOtp } from "../../api/auth.api";
import { useNavigate } from "react-router-dom";
import { FiPhone, FiCreditCard, FiArrowRight } from "react-icons/fi";

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

        if (!aadhaar || aadhaar.length !== 12) {
            setError("Please enter a valid 12-digit Aadhaar number");
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
                    autoFillOtp: res.data.otp // This matches your backend res.json({ otp })
                } 
            });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 p-8 lg:p-10">
                <div className="text-center mb-10">
                    <div className="inline-block p-4 bg-blue-600 rounded-3xl text-white mb-4 shadow-lg shadow-blue-200">
                        <span className="text-2xl">🏨</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Guest Portal</h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Administrative Access</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    <div className="group">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Phone Number
                        </label>
                        <div className="relative">
                            <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="tel"
                                placeholder="8200XXXXXX"
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-bold text-slate-700"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            />
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                            Aadhaar Identification
                        </label>
                        <div className="relative">
                            <FiCreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="12-digit UIDAI number"
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all font-bold text-slate-700"
                                value={aadhaar}
                                onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleSendOtp}
                        disabled={loading}
                        className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                    >
                        {loading ? "Processing..." : "Authorize OTP"}
                        <FiArrowRight strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
}