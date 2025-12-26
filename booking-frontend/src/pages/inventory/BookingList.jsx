import { useEffect, useState } from "react";
import { getBookings } from "../../api/booking.api";
import { useNavigate } from "react-router-dom";

export default function BookingList() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getBookings();
            setBookings(res.data || []);
        } catch (err) {
            console.error("Error loading bookings:", err);
            setError(err.response?.data?.message || "Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="p-6">
                <h2 className="text-xl font-bold">Inventory – Bookings</h2>
                <div className="text-center py-8">Loading bookings...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <h2 className="text-xl font-bold">Inventory – Bookings</h2>
                <div className="text-red-600 bg-red-50 p-4 rounded mt-4">
                    Error: {error}
                    <button onClick={load} className="ml-4 underline">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Inventory – Bookings</h2>

            {bookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No bookings found
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full mt-4 border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2 text-left">Confirmation #</th>
                                <th className="border p-2 text-left">Room</th>
                                <th className="border p-2 text-left">Check-In</th>
                                <th className="border p-2 text-left">Check-Out</th>
                                <th className="border p-2 text-left">Status</th>
                                <th className="border p-2 text-left">Source</th>
                                <th className="border p-2 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(b => (
                                <tr key={b._id} className="hover:bg-gray-50">
                                    <td className="border p-2">{b.confirmationNumber || b._id.slice(-8)}</td>
                                    <td className="border p-2">
                                        {b.roomId?.roomNumber || "N/A"}
                                    </td>
                                    <td className="border p-2">{formatDate(b.checkIn)}</td>
                                    <td className="border p-2">{formatDate(b.checkOut)}</td>
                                    <td className="border p-2">
                                        <span className={`px-2 py-1 rounded text-sm ${
                                            b.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
                                            b.status === "CHECKED_IN" ? "bg-blue-100 text-blue-800" :
                                            b.status === "CHECKED_OUT" ? "bg-gray-100 text-gray-800" :
                                            b.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                                            "bg-yellow-100 text-yellow-800"
                                        }`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="border p-2">{b.bookingSource || "N/A"}</td>
                                    <td className="border p-2">
                                        <button
                                            onClick={() => navigate(`/inventory/edit/${b._id}`)}
                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Modify
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
