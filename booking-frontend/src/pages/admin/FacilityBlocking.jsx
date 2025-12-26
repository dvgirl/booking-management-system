import { useState } from "react";
import { blockFacility } from "../../api/admin.api";
import { toast } from "react-toastify";
import { 
  NoSymbolIcon, 
  CalendarDaysIcon, 
  HashtagIcon, 
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

export default function FacilityBlocking() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        roomNumber: "",
        from: "",
        to: "",
        reason: ""
    });

    const block = async (e) => {
        e.preventDefault();
        
        // Basic Validation
        if (!data.roomNumber || !data.from || !data.to || !data.reason) {
            return toast.warn("Please fill in all fields");
        }

        try {
            setLoading(true);
            await blockFacility(data);
            toast.success(`Room ${data.roomNumber} has been blocked`);
            // Reset form
            setData({ roomNumber: "", from: "", to: "", reason: "" });
        } catch (err) {
            console.error(err);
            toast.error("Failed to block facility");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
            <div className="max-w-2xl mx-auto">
                
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <div className="bg-red-100 p-3 rounded-2xl">
                        <NoSymbolIcon className="w-8 h-8 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-extrabold text-slate-900">Facility Blocking</h2>
                        <p className="text-slate-500">Temporarily remove rooms from the booking inventory for maintenance.</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200 overflow-hidden">
                    {/* Warning Banner */}
                    <div className="bg-amber-50 border-b border-amber-100 p-4 flex gap-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-800 leading-relaxed">
                            <strong>Note:</strong> Blocking a facility will prevent any new bookings during the selected date range. Existing bookings may need manual adjustment.
                        </p>
                    </div>

                    <form onSubmit={block} className="p-8 space-y-6">
                        {/* Room Selection */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Room / Unit Number</label>
                            <div className="relative">
                                <HashtagIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input 
                                    placeholder="e.g. 101, 204 or Deluxe-01" 
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-slate-800 font-medium placeholder:text-slate-400"
                                    value={data.roomNumber}
                                    onChange={e => setData({ ...data, roomNumber: e.target.value })} 
                                />
                            </div>
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Blocking Starts</label>
                                <div className="relative">
                                    <CalendarDaysIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input 
                                        type="date" 
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                                        value={data.from}
                                        onChange={e => setData({ ...data, from: e.target.value })} 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Blocking Ends</label>
                                <div className="relative">
                                    <CalendarDaysIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input 
                                        type="date" 
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                                        value={data.to}
                                        onChange={e => setData({ ...data, to: e.target.value })} 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Reason */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Reason for Blocking</label>
                            <div className="relative">
                                <ChatBubbleLeftRightIcon className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                                <textarea 
                                    placeholder="e.g. Deep cleaning, AC repair, painting..." 
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all min-h-[120px] text-slate-800"
                                    value={data.reason}
                                    onChange={e => setData({ ...data, reason: e.target.value })} 
                                />
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-4">
                            <button 
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
                                    loading 
                                    ? "bg-slate-400 cursor-not-allowed" 
                                    : "bg-red-600 hover:bg-red-700 active:scale-[0.98] shadow-red-200"
                                }`}
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <NoSymbolIcon className="w-6 h-6" />
                                        Confirm & Block Facility
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
                
                {/* Cancel Link */}
                <p className="text-center mt-6 text-slate-400 text-sm">
                    Changed your mind? <button className="text-slate-600 font-bold hover:underline" onClick={() => window.history.back()}>Go back to Dashboard</button>
                </p>
            </div>
        </div>
    );
}