import { useState } from "react";
import { checkAvailability } from "../../api/availability.api";
import AvailableRooms from "./AvailableRooms";

export default function AvailabilitySearch() {
    const [dates, setDates] = useState({ checkIn: "", checkOut: "" });
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const searchRooms = async () => {
        if (!dates.checkIn || !dates.checkOut) {
            setError("Please select both check-in and check-out dates");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const res = await checkAvailability(dates.checkIn, dates.checkOut);
            setRooms(res.data.availableRooms || []);
        } catch (err) {
            console.error("Error checking availability:", err);
            setError(err.response?.data?.message || "Failed to check availability");
            setRooms([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold">Search Availability</h2>

            <div className="flex gap-4 mt-4">
                <input 
                    type="date" 
                    value={dates.checkIn}
                    onChange={e => setDates({ ...dates, checkIn: e.target.value })} 
                    className="border rounded px-3 py-2"
                />
                <input 
                    type="date" 
                    value={dates.checkOut}
                    onChange={e => setDates({ ...dates, checkOut: e.target.value })} 
                    className="border rounded px-3 py-2"
                />
                <button 
                    onClick={searchRooms} 
                    disabled={loading}
                    className="btn-primary disabled:opacity-50"
                >
                    {loading ? "Searching..." : "Search"}
                </button>
            </div>

            {error && (
                <div className="mt-4 text-red-600 bg-red-50 p-3 rounded">
                    {error}
                </div>
            )}

            <AvailableRooms rooms={rooms} dates={dates} />
        </div>
    );
}
