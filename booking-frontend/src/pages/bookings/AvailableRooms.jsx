import { useState } from "react";
import { createBooking } from "../../api/booking.api";
import { useNavigate } from "react-router-dom";

export default function AvailableRooms({ rooms, dates }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState({});

    const bookRoom = async (room) => {
        try {
            setLoading({ [room._id]: true });
            const res = await createBooking({
                roomId: room._id,
                checkIn: dates.checkIn,
                checkOut: dates.checkOut
            });

            navigate("/booking-confirm", { state: res.data });
        } catch (err) {
            console.error("Error creating booking:", err);
            alert(err.response?.data?.message || "Failed to create booking");
        } finally {
            setLoading({ [room._id]: false });
        }
    };

    if (!rooms || rooms.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                No rooms available for selected dates
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 gap-4 mt-6">
            {rooms.map(room => (
                <div key={room._id} className="border p-4 rounded">
                    <h3 className="font-bold">Room {room.roomNumber}</h3>
                    {room.type && <p className="text-sm text-gray-600">Type: {room.type}</p>}
                    {room.amenities && room.amenities.length > 0 && (
                        <p className="text-sm">Amenities: {room.amenities.join(", ")}</p>
                    )}
                    {room.price && <p className="text-sm font-semibold">Price: ₹{room.price}/night</p>}

                    <button
                        onClick={() => bookRoom(room)}
                        disabled={loading[room._id]}
                        className="btn-primary mt-2 w-full disabled:opacity-50"
                    >
                        {loading[room._id] ? "Booking..." : "Book Now"}
                    </button>
                </div>
            ))}
        </div>
    );
}
