import { useState } from "react";
import { createPayment } from "../../api/transaction.api";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
    FiChevronLeft, FiSmartphone, FiDollarSign, FiHash, FiShield, FiSave
} from "react-icons/fi";

export default function PaymentEntry() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Extract data passed from Booking List
    const { bookingId, userId, amount, roomNumber } = location.state || {};
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        mode: "OFFLINE",
        method: "CASH",
        amount: amount || "", // Auto-fills from booking data
        referenceId: "",
        createdBy: "Front Desk"
    });

    const submit = async () => {
        if (!form.amount || parseFloat(form.amount) <= 0) {
            return toast.error("Please enter a valid amount");
        }

        setLoading(true);
        try {
            await createPayment({
                bookingId,
                userId,
                amount: parseFloat(form.amount),
                paymentMode: form.method,
                isOffline: form.mode === "OFFLINE",
                transactionRef: form.referenceId
            });
            
            toast.success("Transaction committed. Booking Confirmed.");
            // Redirect back to booking list after success
            setTimeout(() => navigate("/bookings"), 1500);
        } catch (err) {
            toast.error(err.response?.data?.message || "Ledger commit failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-12 animate-in fade-in duration-500">
            <div className="max-w-2xl mx-auto">

                <header className="mb-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-all mb-4"
                    >
                        <FiChevronLeft /> Cancel & Return
                    </button>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">Settlement Entry</h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Recording payment for Booking Confimation.</p>
                </header>

                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    
                    {/* MODE TOGGLE */}
                    <div className="bg-slate-50 p-2 flex gap-1 border-b border-slate-100">
                        {["OFFLINE", "ONLINE"].map((m) => (
                            <button
                                key={m}
                                onClick={() => setForm({ ...form, mode: m })}
                                className={`flex-1 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all ${form.mode === m
                                        ? "bg-white text-indigo-600 shadow-sm border border-slate-100"
                                        : "text-slate-400 hover:text-slate-600"
                                    }`}
                            >
                                {m} MODE
                            </button>
                        ))}
                    </div>

                    <div className="p-8 md:p-12 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* METHOD */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                    <FiSmartphone /> Settlement Method
                                </label>
                                <select
                                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 font-bold text-slate-700 focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
                                    value={form.method}
                                    onChange={e => setForm({ ...form, method: e.target.value })}
                                >
                                    <option value="CASH">💵 Physical Cash</option>
                                    <option value="UPI">📱 Unified Payments (UPI)</option>
                                    <option value="BANK_TRANSFER">🏦 Bank Wire</option>
                                    <option value="CARD">🏧 Terminal Swipe</option>
                                </select>
                            </div>

                            {/* AMOUNT */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                    <FiDollarSign /> Transaction Value
                                </label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300">₹</span>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-10 pr-5 py-4 font-black text-xl text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
                                        value={form.amount}
                                        onChange={e => setForm({ ...form, amount: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* REFERENCE ID */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                <FiHash /> Audit Reference / UTR
                            </label>
                            <input
                                placeholder="Receipt number or Transaction ID"
                                className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 font-mono text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
                                value={form.referenceId}
                                onChange={e => setForm({ ...form, referenceId: e.target.value })}
                            />
                        </div>

                        {/* LINKED DATA DISPLAY */}
                        {bookingId && (
                            <div className="bg-indigo-50/50 p-6 rounded-[1.5rem] border border-indigo-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Linked Booking</p>
                                    <p className="text-sm font-mono font-bold text-indigo-900">ID: {bookingId.slice(-8)}</p>
                                    {roomNumber && (
                                        <p className="text-xs font-black text-indigo-600">ROOM: {roomNumber}</p>
                                    )}
                                </div>
                                <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
                                    <FiShield />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={submit}
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><FiSave /> Confirm & Pay</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}