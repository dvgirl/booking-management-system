import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getBookingDetails,
  confirmBooking,
  rejectBooking
} from "../../api/booking.api";
import { toast } from "react-toastify";

export default function AdminBookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDetails();
  }, []);

  const loadDetails = async () => {
    try {
      const res = await getBookingDetails(id);
      setBooking(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  const approve = async () => {
    try {
      await confirmBooking(id);
      toast.success("Booking confirmed");
      navigate("/admin/bookings");
    } catch (err) {
      toast.error("Approval failed");
    }
  };

  const reject = async () => {
    try {
      await rejectBooking(id);
      toast.success("Booking rejected");
      navigate("/admin/bookings");
    } catch (err) {
      toast.error("Rejection failed");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
    </div>
  );

  if (!booking) return (
    <div className="p-10 text-center">
      <h2 className="text-xl font-bold">Booking not found</h2>
      <button onClick={() => navigate("/admin/bookings")} className="mt-4 text-blue-600 font-bold underline">Go Back</button>
    </div>
  );

  const allKycVerified =
    booking.kycList?.length > 0 &&
    booking.kycList.every(k => k.kycStatus === "VERIFIED");

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation & Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <button 
              onClick={() => navigate("/admin/bookings")}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 mb-2 block transition-colors"
            >
              ← Back to Approvals
            </button>
            <h1 className="text-3xl font-black tracking-tight">Verify Reservation</h1>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={reject}
              className="px-6 py-3 bg-white border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-100 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all"
            >
              Reject Request
            </button>
            <button 
              onClick={approve}
              disabled={!allKycVerified}
              className={`px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg ${
                allKycVerified 
                ? "bg-slate-900 text-white hover:bg-green-600 shadow-slate-200" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              }`}
            >
              {allKycVerified ? "Approve Booking" : "Awaiting Verification"}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Summary Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-6">Reservation Summary</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Guest</label>
                  <p className="font-bold text-lg">{booking.user?.phone}</p>
                  <p className="text-sm text-slate-500">{booking.user?.name || "No name provided"}</p>
                </div>

                <div className="pt-6 border-t border-slate-50">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Room</label>
                  <p className="font-black text-2xl text-slate-900">#{booking.room?.roomNumber}</p>
                </div>

                <div className="pt-6 border-t border-slate-50">
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Stay Period</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="text-center bg-slate-50 p-2 rounded-xl flex-1">
                      <span className="block text-[9px] font-black text-slate-400 uppercase">In</span>
                      <span className="text-xs font-bold">{new Date(booking.checkIn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                    </div>
                    <div className="text-center bg-slate-50 p-2 rounded-xl flex-1">
                      <span className="block text-[9px] font-black text-slate-400 uppercase">Out</span>
                      <span className="text-xs font-bold">{new Date(booking.checkOut).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {!allKycVerified && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                <p className="text-amber-700 text-[11px] font-bold leading-relaxed">
                  ⚠️ Approval is locked until all submitted KYC documents are marked as <b>VERIFIED</b>.
                </p>
              </div>
            )}
          </div>

          {/* Right: KYC Documents Grid */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Submitted Documents</h3>
            
            {booking.kycList?.length === 0 ? (
              <div className="bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-medium">No documents have been uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {booking.kycList.map(kyc => (
                  <div key={kyc._id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm group">
                    <div className="p-8 flex flex-col md:flex-row gap-8">
                      {/* Document Image */}
                      <div className="w-full md:w-64 h-44 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0">
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL}/${kyc.documentUrl}`}
                          alt="KYC"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-zoom-in"
                          onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL}/${kyc.documentUrl}`, '_blank')}
                        />
                      </div>

                      {/* Document Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded mb-2 inline-block">
                              {kyc.type}
                            </span>
                            <h4 className="text-xl font-bold text-slate-900">{kyc.fullName}</h4>
                            <p className="text-sm font-mono text-slate-400 mt-1 uppercase tracking-tighter">
                              Aadhaar: XXXX-XXXX-{kyc.aadhaarLast4}
                            </p>
                          </div>
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                            kyc.kycStatus === 'VERIFIED' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${kyc.kycStatus === 'VERIFIED' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>
                            {kyc.kycStatus}
                          </div>
                        </div>

                        <div className="pt-4 flex gap-2">
                           {/* Add verification action buttons here if needed */}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}