import { useState } from "react";
import { createPayment } from "../../api/transaction.api";
import { useNavigate, useLocation } from "react-router-dom";

export default function PaymentEntry() {
    const navigate = useNavigate();
    const location = useLocation();
    const { bookingId, userId } = location.state || {};
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const [form, setForm] = useState({
        mode: "OFFLINE",
        method: "CASH",
        amount: "",
        referenceId: "",
        createdBy: "Front Desk"
    });

    const submit = async () => {
        setError("");
        setSuccess(false);

        if (!form.amount || parseFloat(form.amount) <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        setLoading(true);
        try {
            await createPayment({
                bookingId,
                userId,
                ...form,
                amount: parseFloat(form.amount)
            });
            setSuccess(true);
            setTimeout(() => {
                navigate("/finance/list");
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to record payment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 lg:p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Payment Entry</h2>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    Payment recorded successfully! Redirecting...
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode *</label>
                        <select
                            className="input"
                            value={form.mode}
                            onChange={e => setForm({ ...form, mode: e.target.value })}
                        >
                            <option value="OFFLINE">Offline</option>
                            <option value="ONLINE">Online</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                        <select
                            className="input"
                            value={form.method}
                            onChange={e => setForm({ ...form, method: e.target.value })}
                        >
                            <option value="CASH">Cash</option>
                            <option value="UPI">UPI</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                            <option value="RAZORPAY">Razorpay</option>
                            <option value="CARD">Card</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                        <input
                            placeholder="Enter amount"
                            type="number"
                            step="0.01"
                            min="0"
                            className="input"
                            value={form.amount}
                            onChange={e => setForm({ ...form, amount: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reference ID / UTR</label>
                        <input
                            placeholder="Enter reference number (optional)"
                            className="input"
                            value={form.referenceId}
                            onChange={e => setForm({ ...form, referenceId: e.target.value })}
                        />
                    </div>
                </div>

                {bookingId && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">Booking ID:</span> {bookingId}
                        </p>
                    </div>
                )}

                <div className="flex gap-4 pt-4">
                    <button
                        onClick={submit}
                        disabled={loading || success}
                        className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Processing..." : "Save Payment"}
                    </button>
                    <button
                        onClick={() => navigate("/finance/list")}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
