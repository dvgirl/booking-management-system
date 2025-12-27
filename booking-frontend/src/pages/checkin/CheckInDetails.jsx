import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { physicalCheckIn } from "../../api/booking.api";
import { getMyKyc } from "../../api/kyc.api";
import { toast } from "react-toastify";
import { 
  FiArrowLeft, FiUser, FiHome, FiCalendar, 
  FiShield, FiFileText, FiAlertCircle, FiCheck 
} from "react-icons/fi";

export default function CheckInDetails() {
  const { state: booking } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userKyc, setUserKyc] = useState([]);
  const [checkingKyc, setCheckingKyc] = useState(false);

  useEffect(() => {
    if (booking?.userId?._id) {
      checkUserKyc();
    }
  }, [booking]);

  const checkUserKyc = async () => {
    try {
      setCheckingKyc(true);
      // Assuming getMyKyc can take a userId or it checks the current context
      const response = await getMyKyc(booking.userId._id); 
      setUserKyc(response.data || []);
    } catch (error) {
      console.error("KYC Lookup Error:", error);
    } finally {
      setCheckingKyc(false);
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 text-slate-300">
          <FiAlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Session Expired</h2>
        <p className="text-slate-500 mt-2 mb-8 max-w-xs">The booking data could not be retrieved. Please return to the search terminal.</p>
        <button onClick={() => navigate("/checkin/search")} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-slate-900/20 active:scale-95 transition-all">
          Return to Search
        </button>
      </div>
    );
  }

  const hasBookingKyc = booking.kycIds && booking.kycIds.length > 0;
  const hasUserKyc = userKyc.length > 0;

  const handleCompleteCheckIn = async (kycIds = null) => {
    try {
      setLoading(true);
      const idsToUse = kycIds || booking.kycIds || userKyc.map(k => k._id);
      await physicalCheckIn(booking._id, idsToUse);
      toast.success("Guest registration complete!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Process failed. Verify all requirements.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate("/checkin/search")}
          className="group flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-all font-black text-[10px] uppercase tracking-[0.2em]"
        >
          <div className="p-2 bg-white rounded-lg border border-slate-200 group-hover:border-slate-900 transition-colors">
            <FiArrowLeft />
          </div>
          Back to Terminal
        </button>
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Registration</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* MAIN DETAILS COLUMN */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Guest Registration</h1>
                <p className="text-slate-400 font-mono text-[10px] mt-1 uppercase tracking-widest">ID: {booking._id}</p>
              </div>
              <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border ${
                booking.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
              }`}>
                {booking.status}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <section>
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                    <FiUser className="text-indigo-600" /> Primary Contact
                  </label>
                  <p className="text-2xl font-black text-slate-800">{booking.userId?.phone || booking.phone || "Guest"}</p>
                  <p className="text-sm text-slate-500 font-medium">{booking.userId?.name || "No name provided"}</p>
                </section>

                <section>
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                    <FiHome className="text-indigo-600" /> Room Allocation
                  </label>
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-black text-blue-600">#{booking.roomId?.roomNumber || "---"}</p>
                    <span className="px-2 py-1 bg-blue-50 text-blue-500 text-[10px] font-black rounded-lg">PREMIUM</span>
                  </div>
                </section>
              </div>

              <div className="space-y-8">
                <section className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                    <FiCalendar className="text-indigo-600" /> Stay Period
                  </label>
                  <div className="flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Check-In</p>
                        <p className="text-sm font-black text-slate-800">{new Date(booking.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                    </div>
                    <FiArrowLeft className="rotate-180 text-slate-300" />
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Check-Out</p>
                        <p className="text-sm font-black text-slate-800">{new Date(booking.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</p>
                    </div>
                  </div>
                </section>

                <div className="flex items-center justify-between px-2">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment</p>
                        <p className={`text-xs font-black mt-1 flex items-center gap-1.5 ${booking.paymentStatus === 'PAID' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {booking.paymentStatus === 'PAID' ? <FiCheck /> : <FiAlertCircle />}
                            {booking.paymentStatus}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Source</p>
                        <p className="text-xs font-black text-slate-800 mt-1">{booking.bookingSource || "Direct"}</p>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR: KYC ACTIONS */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl shadow-indigo-200 sticky top-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/30">
                    <FiShield size={20} />
                </div>
                <h3 className="text-lg font-bold">Document Verification</h3>
            </div>

            <div className="space-y-6">
              {checkingKyc ? (
                <div className="py-10 text-center animate-pulse">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Scanning Registry...</p>
                </div>
              ) : hasBookingKyc ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-3 text-emerald-400">
                    <FiCheck className="text-xl" />
                    <p className="text-xs font-black uppercase tracking-widest">Ready to Check-in</p>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">Identity documents have been pre-verified for this specific booking.</p>
                </div>
              ) : hasUserKyc ? (
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-3 text-indigo-400">
                    <FiFileText className="text-xl" />
                    <p className="text-xs font-black uppercase tracking-widest">Returning Guest</p>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">We found {userKyc.length} documents from previous stays. Use these to skip scanning?</p>
                </div>
              ) : (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-3 text-rose-400">
                    <FiAlertCircle className="text-xl" />
                    <p className="text-xs font-black uppercase tracking-widest">Documents Missing</p>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">Regulatory compliance requires valid ID documents before check-in can proceed.</p>
                </div>
              )}

              <div className="pt-6 space-y-3">
                {hasBookingKyc ? (
                  <button onClick={() => handleCompleteCheckIn()} disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-emerald-500/20">
                    {loading ? "Registering..." : "Finalize Check-In"}
                  </button>
                ) : hasUserKyc ? (
                  <button onClick={() => handleCompleteCheckIn(userKyc.map(k => k._id))} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-indigo-600/20">
                    {loading ? "Registering..." : "Use Existing ID"}
                  </button>
                ) : (
                  <button onClick={() => navigate("/checkin/upload", { state: booking })} className="w-full bg-white text-slate-900 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:bg-slate-100 shadow-lg shadow-white/5">
                    Start ID Scan
                  </button>
                )}
                
                <button 
                  onClick={() => navigate("/checkin/search")} 
                  className="w-full bg-transparent border border-slate-700 text-slate-500 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all hover:bg-slate-800 hover:text-slate-300"
                >
                  Cancel Process
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}