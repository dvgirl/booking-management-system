import { useEffect, useState } from "react";
import { getCheckinHistory } from "../../api/booking.api"; // Updated import to match earlier context
import { useNavigate } from "react-router-dom";
import { FiRefreshCw, FiUser, FiHome, FiExternalLink, FiSearch } from "react-icons/fi";

export default function CheckInHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const res = await getCheckinHistory();
            const data = res?.data ? (Array.isArray(res.data) ? res.data : res.data.bookings || []) : [];
            setHistory(data);
        } catch (error) {
            console.error("Error loading check-in history:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "---";
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="h-1 w-8 bg-slate-900 rounded-full"></span>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Registry Logs</p>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Check-in History</h1>
                    <p className="text-slate-500 font-medium mt-1">Reviewing {history.length} historical and active records.</p>
                </div>

                <button 
                    onClick={loadHistory}
                    disabled={loading}
                    className="flex items-center justify-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:border-slate-900 hover:text-slate-900 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                    <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} />
                    Refresh Logs
                </button>
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Guest Ledger</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Room Info</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Stay Timeline</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Financials</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Log Status</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-32">
                                        <div className="flex flex-col items-center gap-4 text-slate-300">
                                            <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                                            <p className="text-[10px] font-black uppercase tracking-widest">Compiling Records...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : history.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-32 text-center">
                                        <div className="max-w-xs mx-auto text-slate-400">
                                            <FiSearch size={40} className="mx-auto mb-4 opacity-20" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">No Records Found</p>
                                            <p className="text-xs mt-2 opacity-60 font-medium">There are no check-in logs available at this time.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                history.map((item) => (
                                    <tr key={item._id} className="group hover:bg-slate-50/80 transition-colors">
                                        {/* GUEST INFO */}
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                                    <FiUser size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-800 tracking-tight">
                                                        {item.userId?.phone || "No Contact"}
                                                    </div>
                                                    <div className="text-[9px] text-slate-400 font-mono uppercase tracking-widest mt-0.5">
                                                        REF: {item._id?.slice(-8)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* ROOM INFO */}
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                    <FiHome size={14} />
                                                </div>
                                                <span className="text-sm font-black text-slate-700">
                                                    Room {item.roomId?.roomNumber || "N/A"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* DATES */}
                                        <td className="px-8 py-6 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black text-slate-300 uppercase w-6">In</span>
                                                    <span className="text-xs font-bold text-slate-600">{formatDate(item.checkIn)}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black text-slate-300 uppercase w-6">Out</span>
                                                    <span className="text-xs font-bold text-slate-600">{formatDate(item.checkOut)}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* SOURCE & PAYMENT */}
                                        <td className="px-8 py-6">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                                                {item.bookingSource || "Direct"}
                                            </div>
                                            <div className={`text-[10px] font-black flex items-center gap-1.5 ${item.paymentStatus === 'PAID' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${item.paymentStatus === 'PAID' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                {item.paymentStatus || 'UNPAID'}
                                            </div>
                                        </td>

                                        {/* STATUS */}
                                        <td className="px-8 py-6">
                                            <span className={`inline-block px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-[0.1em] border ${
                                                item.status === "CHECKED_IN" 
                                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                    : item.status === "PENDING"
                                                    ? "bg-amber-50 text-amber-600 border-amber-100"
                                                    : "bg-slate-100 text-slate-500 border-slate-200"
                                            }`}>
                                                {item.status?.replace('_', ' ')}
                                            </span>
                                        </td>

                                        {/* ACTION */}
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => navigate(`/checkin/details`, { state: item })}
                                                className="inline-flex items-center justify-center w-10 h-10 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-900 rounded-xl transition-all shadow-sm group/btn active:scale-90"
                                            >
                                                <FiExternalLink size={16} />
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