import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { physicalCheckIn } from "../../api/booking.api";
import { getMyKyc } from "../../api/kyc.api";
import { toast } from "react-toastify";

export default function CheckInDetails() {
  const { state: booking } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userKyc, setUserKyc] = useState([]);
  const [checkingKyc, setCheckingKyc] = useState(false);

  useEffect(() => {
    if (!booking?.kycIds || booking.kycIds.length === 0) {
      checkUserKyc();
    }
  }, [booking]);

  const checkUserKyc = async () => {
    try {
      setCheckingKyc(true);
      const response = await getMyKyc();
      setUserKyc(response.data || []);
    } catch (error) {
      console.error("Error checking user KYC:", error);
    } finally {
      setCheckingKyc(false);
    }
  };

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-6 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-800">No Booking Found</h2>
        <p className="text-slate-500 mb-6">Please start by searching for a guest booking.</p>
        <button onClick={() => navigate("/checkin/search")} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold">
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
      toast.success("Guest checked in successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to complete check-in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        
        {/* Top Navigation */}
        <button 
          onClick={() => navigate("/checkin/search")}
          className="group flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-8 font-bold text-sm uppercase tracking-widest"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Search
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Guest Information Card */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h1 className="text-3xl font-black tracking-tight">Booking Details</h1>
                  <p className="text-slate-400 font-mono text-xs mt-1 uppercase">Ref: {booking._id}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {booking.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-10 gap-x-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Guest Contact</label>
                  <p className="text-xl font-bold text-slate-800">{booking.userId?.phone || "No Phone"}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Allocated Room</label>
                  <p className="text-xl font-bold text-blue-600">Room {booking.roomId?.roomNumber || "---"}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Check-In Date</label>
                  <p className="text-lg font-bold text-slate-700">{new Date(booking.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Check-Out Date</label>
                  <p className="text-lg font-bold text-slate-700">{new Date(booking.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Status</label>
                  <p className={`text-sm font-black mt-1 ${booking.paymentStatus === 'PAID' ? 'text-green-500' : 'text-red-500'}`}>
                    {booking.paymentStatus}
                  </p>
                </div>
                <div className="text-right">
                   <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Booking Source</label>
                   <p className="text-sm font-bold text-slate-800">{booking.bookingSource}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: KYC & Action Card */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-300">
              <h3 className="text-xl font-bold mb-6">Verification</h3>
              
              <div className="mb-8">
                {checkingKyc ? (
                   <div className="flex items-center gap-3 text-slate-400">
                     <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                     <span className="text-sm">Verifying records...</span>
                   </div>
                ) : hasBookingKyc ? (
                  <div className="space-y-4">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                      <p className="text-green-400 text-xs font-black uppercase tracking-widest mb-1">Status: Verified</p>
                      <p className="text-sm text-slate-300">{booking.kycIds.length} Documents attached.</p>
                    </div>
                  </div>
                ) : hasUserKyc ? (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
                    <p className="text-blue-400 text-xs font-black uppercase tracking-widest mb-1">Status: Profile Found</p>
                    <p className="text-sm text-slate-300">Using {userKyc.length} docs from history.</p>
                  </div>
                ) : (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4">
                    <p className="text-orange-400 text-xs font-black uppercase tracking-widest mb-1">Status: Required</p>
                    <p className="text-sm text-slate-300">No identity documents found.</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {hasBookingKyc ? (
                  <button onClick={() => handleCompleteCheckIn()} disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50">
                    {loading ? "Processing..." : "Confirm Arrival"}
                  </button>
                ) : hasUserKyc ? (
                  <button onClick={() => handleCompleteCheckIn(userKyc.map(k => k._id))} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all">
                    {loading ? "Processing..." : "Re-use & Check-in"}
                  </button>
                ) : (
                  <button onClick={() => navigate("/checkin/upload", { state: booking })} className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:bg-slate-100">
                    Upload Documents
                  </button>
                )}
                
                <button onClick={() => navigate("/checkin/search")} className="w-full bg-transparent border border-slate-700 text-slate-400 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:bg-slate-800">
                  Dismiss
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}