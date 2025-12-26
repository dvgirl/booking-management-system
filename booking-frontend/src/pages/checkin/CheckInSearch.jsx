import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchBooking } from "../../api/checkin.api";
import { getCheckinHistory } from "../../api/booking.api";
import { toast } from "react-toastify";

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
      
      // FIX: Check if res exists, then check res.data, else fallback to res itself
      const data = res?.data ? res.data : res;
      setBookings(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error("History Load Error:", error);
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return fetchHistory();

    try {
      setLoading(true);
      const res = await searchBooking(query.trim());
      
      // FIX: Safety check for search results
      const data = res?.data ? res.data : res;

      if (data) {
        if (Array.isArray(data)) {
          setBookings(data);
        } else {
          // If it's a single object, wrap it in an array
          setBookings([data]);
        }
      } else {
        setBookings([]);
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
    return nights > 0 ? `${nights} ${nights === 1 ? 'Night' : 'Nights'}` : 'Same Day';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-10">
          <h1 className="text-4xl font-black tracking-tight">Front Desk</h1>
          <p className="text-slate-500 font-medium">Guest check-in and stay monitoring</p>
        </header>

        <div className="relative mb-10">
          <input
            type="text"
            className="w-full pl-6 pr-32 py-5 bg-white border-none rounded-2xl shadow-xl shadow-slate-200/50 focus:ring-2 focus:ring-blue-600 text-lg font-medium outline-none"
            placeholder="Search phone, room, or ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="absolute right-3 top-3 bottom-3 px-8 bg-slate-900 hover:bg-blue-600 disabled:bg-slate-400 text-white font-bold rounded-xl transition-all"
          >
            {loading ? "..." : "Search"}
          </button>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b">Guest & Room</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b">Stay Dates</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400 border-b">Status</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400 border-b">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-medium italic">
                      Checking records...
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-medium">
                      No active bookings found.
                    </td>
                  </tr>
                ) : (
                  bookings.map((item) => (
                    <tr key={item?._id} className="hover:bg-blue-50/20 transition-colors">
                      <td className="px-8 py-6">
                        <div className="text-lg font-bold text-slate-900">
                          {item?.userId?.phone || "Guest"}
                        </div>
                        <div className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-black rounded uppercase">
                          Room {item?.roomId?.roomNumber || '---'}
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="text-[10px] font-black text-slate-400 uppercase">In</div>
                            <div className="text-sm font-bold text-slate-700">{formatDate(item?.checkIn)}</div>
                          </div>
                          <div className="h-4 border-r border-slate-200"></div>
                          <div className="text-center">
                            <div className="text-[10px] font-black text-slate-400 uppercase">Out</div>
                            <div className="text-sm font-bold text-slate-700">{formatDate(item?.checkOut)}</div>
                          </div>
                          <div className="ml-2 px-2 py-1 bg-slate-100 rounded text-[9px] font-black text-slate-500 uppercase">
                            {calculateNights(item?.checkIn, item?.checkOut)}
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <div className={`text-[11px] font-black uppercase tracking-wide mb-1 ${
                          item?.status === 'CHECKED_IN' ? 'text-green-600' : 
                          item?.status === 'CHECKED_OUT' ? 'text-slate-400' : 'text-amber-500'
                        }`}>
                          {item?.status?.replace('_', ' ')}
                        </div>
                        <div className={`text-[10px] font-bold ${item?.paymentStatus === 'PAID' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {item?.paymentStatus}
                        </div>
                      </td>

                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => navigate("/checkin/details", { state: item })}
                          className="bg-slate-900 text-white hover:bg-blue-600 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
                        >
                          Details
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
    </div>
  );
}