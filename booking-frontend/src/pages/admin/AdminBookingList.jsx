import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBookingsByStatus,
  getBookings,
  updateBookingStatus
} from "../../api/booking.api";
import {
  FiCheckCircle, FiXCircle,
  FiAlertCircle, FiLoader, FiRefreshCw, FiSearch
} from "react-icons/fi";
import { toast } from "react-toastify";

export default function AdminBookingList() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING");
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Get user data from local storage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Role checks matching your User model schema
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isAdmin = user?.role === 'ADMIN';
  const canPerformActions = isSuperAdmin || isAdmin;

  // ================= FETCH LOGIC =================
  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      // Backend now handles filtering based on req.user.role and hotelId
      if (activeTab === "HISTORY") {
        res = await getBookings();
      } else {
        res = await getBookingsByStatus(activeTab);
      }
      setBookings(res?.data || res || []);
    } catch (err) {
      toast.error(`Failed to load ${activeTab} bookings`);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // ================= ACTION HANDLER =================
  const handleAction = async (booking, nextStatus) => {
    const { _id, paymentStatus, totalAmount, userId, roomId } = booking;

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

    if (!window.confirm(`Move to ${nextStatus.replace('_', ' ')}?`)) return;

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

  // ================= FILTER LOGIC =================
  const filteredBookings = bookings.filter(b =>
    b.userId?.phone?.includes(searchTerm) ||
    b.roomId?.roomNumber?.toString().includes(searchTerm) ||
    b.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-8 font-sans text-slate-900 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              {isSuperAdmin ? "GLOBAL RESERVATIONS" : "HOTEL RESERVATIONS"}
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {isSuperAdmin ? "Super Admin Access (All Properties)" : `Property Management: ${user.name}`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-grow sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Guest name, phone or room..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
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
                    activeTab === tab ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button onClick={loadBookings} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-sm group">
              <FiRefreshCw className={`${loading ? "animate-spin text-indigo-600" : "text-slate-600 group-hover:rotate-180 transition-transform duration-500"}`} />
            </button>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
          {loading && bookings.length === 0 ? (
            <div className="py-32 text-center">
              <FiLoader className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Synchronizing Data...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-32 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiAlertCircle size={32} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Reservations Found</h3>
              <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest Information</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Room Detail</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Schedule</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status & Finance</th>
                    {canPerformActions && (
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-indigo-50/10 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shadow-sm">
                            {booking.userId?.name?.charAt(0) || "G"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{booking.userId?.name || "Anonymous"}</p>
                            <p className="text-[11px] font-medium text-slate-400">{booking.userId?.phone || "No Phone"}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-700">Unit {booking.roomId?.roomNumber || "N/A"}</span>
                          <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-tight mt-0.5">₹{booking.totalAmount.toLocaleString()}</span>
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <div className="text-[11px] font-bold text-slate-600 bg-slate-100/50 px-3 py-1 rounded-full w-fit">
                          {new Date(booking.checkIn).toLocaleDateString('en-GB')}
                          <span className="mx-2 text-slate-300">→</span>
                          {new Date(booking.checkOut).toLocaleDateString('en-GB')}
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          <span className={`w-fit px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                            booking.status === "CONFIRMED" ? "bg-indigo-50 text-indigo-700 border-indigo-100" :
                            booking.status === "CHECKED_IN" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                            booking.status === "CHECKED_OUT" ? "bg-slate-100 text-slate-600 border-slate-200" :
                            booking.status === "CANCELLED" ? "bg-rose-50 text-rose-700 border-rose-100" :
                            "bg-amber-50 text-amber-700 border-amber-100"
                          }`}>
                            {booking.status.replace("_", " ")}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border-l-2 w-fit ${
                            booking.paymentStatus === 'PAID' ? "text-emerald-700 border-emerald-500 bg-emerald-50" : "text-rose-700 border-rose-500 bg-rose-50"
                          }`}>
                            PAYMENT: {booking.paymentStatus}
                          </span>
                        </div>
                      </td>

                      {canPerformActions && (
                        <td className="px-8 py-6 text-right">
                          {actionLoading === booking._id ? (
                            <FiLoader className="animate-spin text-indigo-600 ml-auto" />
                          ) : (
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {booking.status === "PENDING" && (
                                <>
                                  <button onClick={() => handleAction(booking, "CONFIRMED")} className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors shadow-sm bg-white border border-slate-100"><FiCheckCircle size={18} /></button>
                                  <button onClick={() => handleAction(booking, "CANCELLED")} className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shadow-sm bg-white border border-slate-100"><FiXCircle size={18} /></button>
                                </>
                              )}

                              {booking.status === "CONFIRMED" && (
                                <button onClick={() => handleAction(booking, "CHECKED_IN")} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
                                  Check In
                                </button>
                              )}

                              {booking.status === "CHECKED_IN" && (
                                <button onClick={() => handleAction(booking, "CHECKED_OUT")} className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-black shadow-lg shadow-slate-200 transition-all">
                                  Check Out
                                </button>
                              )}

                              {activeTab === "HISTORY" && (booking.status === "CHECKED_OUT" || booking.status === "CANCELLED") && (
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Archived</span>
                              )}
                            </div>
                          )}
                        </td>
                      )}
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