import { useEffect, useState } from "react";
import { getBookings } from "../../api/booking.api";
import { updateBookingStatus } from "../../api/availability.api";
import { FiCheckCircle, FiXCircle, FiUser, FiHome, FiSettings } from "react-icons/fi";

export default function AdminBookingManage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        setLoading(true);
        try {
            const res = await getBookings();
            setBookings(res.data);
        } catch (error) {
            console.error("Failed to load bookings", error);
        } finally {
            setLoading(false);
        }
    };

    const changeStatus = async (id, status) => {
        await updateBookingStatus(id, status);
        load();
    };

    // Helper to style status badges
    const getStatusStyles = (status) => {
        switch (status) {
            case "CONFIRMED": return "bg-emerald-50 text-emerald-700 border-emerald-100";
            case "BLOCKED": return "bg-rose-50 text-rose-700 border-rose-100";
            case "PENDING": return "bg-amber-50 text-amber-700 border-amber-100";
            default: return "bg-slate-50 text-slate-700 border-slate-100";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">MANAGE BOOKINGS</h2>
                    <p className="text-sm text-slate-500 font-medium">Review, confirm, or restrict guest room reservations.</p>
                </div>
                <button 
                    onClick={load}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                >
                    {loading ? "Refreshing..." : "Refresh Data"}
                </button>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Room</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guest Details</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {bookings.length > 0 ? (
                                bookings.map((b) => (
                                    <tr key={b._id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                                    <FiHome size={18} />
                                                </div>
                                                <span className="font-bold text-slate-700">Room {b.roomNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-800">{b.user?.name || "Anonymous"}</span>
                                                <span className="text-xs text-slate-500">{b.user?.phone || "No Contact"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter ${getStatusStyles(b.status)}`}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => changeStatus(b._id, "CONFIRMED")}
                                                    disabled={b.status === "CONFIRMED"}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
                                                >
                                                    <FiCheckCircle /> Confirm
                                                </button>
                                                <button 
                                                    onClick={() => changeStatus(b._id, "BLOCKED")}
                                                    disabled={b.status === "BLOCKED"}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-600 hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
                                                >
                                                    <FiXCircle /> Block
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                            <FiSettings size={40} className="animate-spin-slow" />
                                            <p className="text-sm font-medium italic">No booking records found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}