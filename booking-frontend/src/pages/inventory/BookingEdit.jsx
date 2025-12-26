import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import BookingChangeHistory from "./BookingChangeHistory";
import { updateBooking, getChangeHistory } from "../../api/inventory.api";

export default function BookingEdit() {
    const { id } = useParams();
    const [form, setForm] = useState({});
    const [history, setHistory] = useState([]);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const h = await getChangeHistory(id);
        setHistory(h.data);
    };

    const save = async () => {
        await updateBooking(id, form);
        alert("Booking updated successfully");
    };

    return (
        <div className="p-6 max-w-xl">
            <h2 className="text-xl font-bold">Modify Booking</h2>

            <input
                type="date"
                className="input mt-4"
                onChange={e => setForm({ ...form, checkIn: e.target.value })}
            />

            <input
                type="date"
                className="input mt-2"
                onChange={e => setForm({ ...form, checkOut: e.target.value })}
            />

            <input
                placeholder="Change Room"
                className="input mt-2"
                onChange={e => setForm({ ...form, roomNumber: e.target.value })}
            />

            <textarea
                placeholder="Reason for change"
                className="input mt-2"
                onChange={e => setForm({ ...form, reason: e.target.value })}
            />

            <button onClick={save} className="btn-primary mt-4">
                Save Changes
            </button>

            <BookingChangeHistory history={history} />
        </div>
    );
}
