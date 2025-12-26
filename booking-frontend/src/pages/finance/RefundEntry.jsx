import { useState } from "react";
import { createRefund } from "../../api/transaction.api";

export default function RefundEntry({ bookingId, userId, paymentId }) {
    const [form, setForm] = useState({
        mode: "ONLINE",
        method: "UPI",
        amount: "",
        referenceId: "",
        createdBy: "Admin"
    });

    const submit = async () => {
        await createRefund({
            bookingId,
            userId,
            paymentId,
            ...form
        });
        alert("Refund processed successfully");
    };

    return (
        <div className="p-6 max-w-md">
            <h2 className="text-xl font-bold">Refund Entry</h2>

            <select onChange={e => setForm({ ...form, mode: e.target.value })}>
                <option value="ONLINE">ONLINE</option>
                <option value="OFFLINE">OFFLINE</option>
            </select>

            <select onChange={e => setForm({ ...form, method: e.target.value })}>
                <option>UPI</option>
                <option>BANK_TRANSFER</option>
                <option>CASH</option>
            </select>

            <input
                placeholder="Refund Amount"
                type="number"
                onChange={e => setForm({ ...form, amount: e.target.value })}
            />

            <input
                placeholder="Reference ID"
                onChange={e => setForm({ ...form, referenceId: e.target.value })}
            />

            <button onClick={submit} className="btn-primary mt-3">
                Process Refund
            </button>
        </div>
    );
}
