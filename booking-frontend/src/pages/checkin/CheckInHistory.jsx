import { useEffect, useState } from "react";
import { getCheckinHistory } from "../../api/checkin.api";
import { useNavigate } from "react-router-dom";

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
            // Handle both res.data as an array or res.data.bookings if applicable
            const data = Array.isArray(res.data) ? res.data : res.data?.bookings || [];
            setHistory(data);
        } catch (error) {
            console.error("Error loading check-in history:", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to format date safely
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Check-in History</h2>
                        <p className="text-sm text-gray-500">Total {history.length} records found</p>
                    </div>
                    <button 
                        onClick={loadHistory}
                        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-100 border-b border-gray-200">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Guest Contact</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Room</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Check In/Out</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Source</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-600 uppercase text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center text-gray-500 font-medium">
                                               <div className="flex flex-col items-center gap-2">
                                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                Fetching details...
                                            </div>
                                        </td>
                                    </tr>
                                ) : history.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-20 text-center text-gray-400 font-medium">
                                            No booking history available.
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((item) => (
                                        <tr key={item._id} className="hover:bg-blue-50/40 transition-colors">
                                            {/* GUEST INFO */}
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {item.userId?.phone || "No Phone"}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">
                                                    ID: {item._id?.slice(-8)}
                                                </div>
                                            </td>

                                            {/* ROOM INFO */}
                                            <td className="px-6 py-4">
                                                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                                    Room {item.roomId?.roomNumber || "N/A"}
                                                </div>
                                            </td>

                                            {/* DATES */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs text-gray-600">
                                                    <span className="font-semibold text-gray-400 mr-1">In:</span> {formatDate(item.checkIn)}
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    <span className="font-semibold text-gray-400 mr-1">Out:</span> {formatDate(item.checkOut)}
                                                </div>
                                            </td>

                                            {/* SOURCE & PAYMENT */}
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-bold text-gray-700">{item.bookingSource || "Direct"}</div>
                                                <div className={`text-[10px] font-black uppercase tracking-tighter ${item.paymentStatus === 'PAID' ? 'text-green-600' : 'text-red-500'}`}>
                                                    {item.paymentStatus}
                                                </div>
                                            </td>

                                            {/* STATUS */}
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-[10px] font-bold rounded shadow-sm ${
                                                    item.status === "CHECKED_IN" 
                                                        ? "bg-green-500 text-white"
                                                        : item.status === "PENDING"
                                                        ? "bg-amber-400 text-white"
                                                        : "bg-gray-400 text-white"
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </td>

                                            {/* ACTION */}
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => navigate(`/checkin/details`, { state: item })}
                                                    className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-all transform hover:scale-105"
                                                >
                                                    View Details
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