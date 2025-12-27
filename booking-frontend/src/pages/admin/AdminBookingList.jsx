import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // Added for navigation
import { 
  getPendingBookings, 
  getBookings, 
  getCheckinHistory,
  updateBookingStatus 
} from "../../api/booking.api";
import { 
  FiCheckCircle, FiXCircle, FiLogIn, FiLogOut, 
  FiAlertCircle, FiLoader, FiRefreshCw, FiSearch, FiArchive, FiClock
} from "react-icons/fi";
import { toast } from "react-toastify";

export default function AdminBookingList() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING"); 
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === "PENDING") res = await getPendingBookings();
      else if (activeTab === "CONFIRMED") res = await getBookings(); 
      else if (activeTab === "HISTORY") res = await getCheckinHistory();

      const actualArray = res?.data || [];
      const sorted = [...actualArray].sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setBookings(sorted);
    } catch (err) {
      toast.error(`Failed to sync ${activeTab.toLowerCase()} list`);
      setBookings([]); 
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // Updated handleAction to support Payment Redirection
  const handleAction = async (booking, nextStatus) => {
    const { _id, paymentStatus, totalAmount, userId, roomId } = booking;

    // Trigger Payment Flow if confirming an unpaid booking
    if (nextStatus === "CONFIRMED" && paymentStatus === "UNPAID") {
      const proceed = window.confirm(`Booking is UNPAID. Redirect to Payment Entry to collect ₹${totalAmount}?`);
      if (proceed) {
        navigate("/finance/pay", { 
          state: { 
            bookingId: _id, 
            userId: userId?._id, 
            amount: totalAmount,
            roomNumber: roomId?.roomNumber 
          } 
        });
        return;
      }
    }

    const confirmMsg = nextStatus === "CANCELLED" 
      ? "Are you sure you want to cancel?" 
      : `Move to ${nextStatus.replace('_', ' ')}?`;

    if (!window.confirm(confirmMsg)) return;

    setActionLoading(_id);
    try {
      await updateBookingStatus(_id, { status: nextStatus });
      toast.success(`Updated to ${nextStatus}`);
      await loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.userId?.phone?.includes(searchTerm) || 
    b.confirmationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.roomId?.roomNumber?.toString().includes(searchTerm) ||
    b.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">RESERVATIONS</h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Management Console</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-grow sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search phone, room or guest..." 
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border-none shadow-sm text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex p-1 bg-white rounded-xl shadow-sm border border-slate-200">
              {["PENDING", "CONFIRMED", "HISTORY"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setSearchTerm(""); }}
                  className={`px-5 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${
                    activeTab === tab ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <button onClick={loadBookings} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm">
              <FiRefreshCw className={loading ? "animate-spin text-blue-600" : "text-slate-600"} />
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {loading && bookings.length === 0 ? (
            <div className="py-24 text-center">
              <FiLoader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Fetching data...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-24 text-center">
              <FiAlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
              <h3 className="text-lg font-bold text-slate-800">No records found</h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest & Reference</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Room</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stay Dates</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status/Payment</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                            {booking.userId?.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{booking.userId?.name || "N/A"}</p>
                            <p className="text-[9px] font-mono text-blue-500 font-bold">#{booking.confirmationNumber}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-700">Room {booking.roomId?.roomNumber || "N/A"}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">₹{booking.totalAmount}</span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <span>{new Date(booking.checkIn).toLocaleDateString('en-GB')}</span>
                          <span className="text-slate-300">→</span>
                          <span>{new Date(booking.checkOut).toLocaleDateString('en-GB')}</span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                            <span className={`w-fit px-3 py-1 rounded-full text-[8px] font-black uppercase border ${
                            booking.status === "CONFIRMED" ? "bg-blue-50 text-blue-700 border-blue-100" :
                            booking.status === "CHECKED_IN" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                            "bg-amber-50 text-amber-700 border-amber-100"
                            }`}>
                            {booking.status}
                            </span>
                            <span className={`text-[8px] font-bold ${booking.paymentStatus === 'PAID' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                ● {booking.paymentStatus}
                            </span>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-right">
                        {actionLoading === booking._id ? (
                          <FiLoader className="animate-spin text-blue-600 ml-auto" />
                        ) : (
                          <div className="flex justify-end gap-2">
                            {booking.status === "PENDING" && (
                              <>
                                <button onClick={() => handleAction(booking, "CONFIRMED")} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="Confirm"><FiCheckCircle size={20} /></button>
                                <button onClick={() => handleAction(booking, "CANCELLED")} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg" title="Cancel"><FiXCircle size={20} /></button>
                              </>
                            )}

                            {booking.status === "CONFIRMED" && (
                              <button onClick={() => handleAction(booking, "CHECKED_IN")} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-blue-700">
                                <FiLogIn /> Check In
                              </button>
                            )}

                            {booking.status === "CHECKED_IN" && (
                              <button onClick={() => handleAction(booking, "CHECKED_OUT")} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-[10px] font-black uppercase hover:bg-orange-600">
                                <FiLogOut /> Check Out
                              </button>
                            )}
                            
                            {(booking.status === "CANCELLED" || booking.status === "CHECKED_OUT") && (
                                <span className="text-[10px] font-black text-slate-300 uppercase italic">Archived</span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}