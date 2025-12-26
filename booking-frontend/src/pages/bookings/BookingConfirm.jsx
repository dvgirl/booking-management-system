import { useLocation } from "react-router-dom";

export default function BookingConfirm() {
    const { state } = useLocation();

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-green-600">
                Booking Requested Successfully
            </h2>

            <div className="border p-4 mt-4 rounded">
                <p><b>Room:</b> {state.roomNumber}</p>
                <p><b>Check-in:</b> {state.checkIn}</p>
                <p><b>Check-out:</b> {state.checkOut}</p>
                <p><b>Status:</b> {state.status}</p>
            </div>

            <p className="mt-4 text-sm text-gray-600">
                Confirmation will be shared after admin approval.
            </p>
        </div>
    );
}
