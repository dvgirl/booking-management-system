import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchBooking } from "../../api/checkin.api";
import { getCheckinHistory } from "../../api/booking.api";
import { toast } from "react-toastify";
import { FiSearch, FiUser, FiCalendar, FiArrowRight, FiInfo, FiClock } from "react-icons/fi";

export default function CheckInSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await getCheckinHistory();
      const data = res?.data ? res.data : res;
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("History Load Error:", error);
      toast.error("Failed to load recent records");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return fetchHistory();

    try {
      setLoading(true);
      const res = await searchBooking(query.trim());
      const data = res?.data ? res.data : res;

      if (data) {
        setBookings(Array.isArray(data) ? data : [data]);
      } else {
        setBookings([]);
        toast.info("No matching records found");
      }
    } catch (error) {
      console.error("Search Error:", error);
      toast.error("Search failed");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? "---" 
      : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  const calculateNights = (inDate, outDate) => {
    if (!inDate || !outDate) return "---";
    const diff = new Date(outDate) - new Date(inDate);
    const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return nights > 0 ? `${nights}N` : '1D';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="h-1 w-8 bg-blue-600 rounded-full"></span>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Operational Terminal</p>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Front Desk</h1>
          <p className="text-slate-500 font-medium mt-1">Guest arrival registration and stay management.</p>
        </div>
      </div>

      {/* Advanced Search Bar */}
      <div className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
          <FiSearch size={24} />
        </div>
        <input
          type="text"
          className="w-full pl-16 pr-44 py-6 bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/40 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 text-xl font-bold outline-none transition-all placeholder:text-slate-300"
          placeholder="Scan ID or enter Phone/Room..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <div className="absolute right-3 top-3 bottom-3 flex gap-2">
          {query && (
            <button 
              onClick={() => { setQuery(""); fetchHistory(); }}
              className="px-4 text-slate-400 hover:text-slate-600 text-xs font-bold uppercase tracking-widest"
            >
              Clear
            </button>
          )}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-10 bg-slate-900 hover:bg-blue-600 disabled:bg-slate-300 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            {loading ? "..." : "Execute Search"}
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Guest & Room</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Stay Duration</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Registry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-10 py-32">
                    <div className="flex flex-col items-center gap-4 text-slate-300">
                      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs font-black uppercase tracking-widest">Accessing Ledger...</p>
                    </div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-10 py-32 text-center">
                    <div className="max-w-xs mx-auto">
                        <FiInfo size={48} className="mx-auto text-slate-100 mb-4" />
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Zero Records Found</p>
                        <p className="text-slate-300 text-xs mt-2">Try searching by the exact mobile number or room identifier.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map((item) => (
                  <tr key={item?._id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                          <FiUser size={20} />
                        </div>
                        <div>
                          <div className="text-lg font-black text-slate-800 tracking-tight">
                            {item?.userId?.phone || item?.phone || "Unknown Guest"}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 bg-slate-900 text-white text-[9px] font-black rounded tracking-widest">
                              ROOM {item?.roomId?.roomNumber || item?.roomNumber || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <FiCalendar size={16} />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-700">{formatDate(item?.checkIn)}</span>
                            <FiArrowRight size={12} className="text-slate-300" />
                            <span className="text-sm font-black text-slate-700">{formatDate(item?.checkOut)}</span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            Total Duration: {calculateNights(item?.checkIn, item?.checkOut)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-10 py-8">
                        <div className="flex flex-col gap-2">
                            <span className={`w-fit px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                            item?.status === 'CHECKED_IN' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            item?.status === 'CHECKED_OUT' ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                            {item?.status?.replace('_', ' ') || 'PENDING'}
                            </span>
                            <div className="flex items-center gap-1.5 ml-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${item?.paymentStatus === 'PAID' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                    {item?.paymentStatus || 'UNPAID'}
                                </span>
                            </div>
                        </div>
                    </td>

                    <td className="px-10 py-8 text-right">
                      <button 
                        onClick={() => navigate("/checkin/details", { state: item })}
                        className="inline-flex items-center justify-center w-12 h-12 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-600 hover:shadow-xl hover:shadow-blue-500/10 rounded-2xl transition-all group/btn"
                      >
                        <FiArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}