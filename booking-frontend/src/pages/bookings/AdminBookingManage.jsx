import { useEffect, useState } from "react";
import { getBookings } from "../../api/booking.api";
import { updateBookingStatus } from "../../api/availability.api";

export default function AdminBookingManage() {
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const res = await getBookings();
        setBookings(res.data);
    };

    const changeStatus = async (id, status) => {
        await updateBookingStatus(id, status);
        load();
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold">Manage Bookings</h2>

            <table className="w-full mt-4">
                <thead>
                    <tr>
                        <th>Room</th>
                        <th>User</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>
                    {bookings.map(b => (
                        <tr key={b._id}>
                            <td>{b.roomNumber}</td>
                            <td>{b.user?.name}</td>
                            <td>{b.status}</td>
                            <td className="space-x-2">
                                <button onClick={() => changeStatus(b._id, "CONFIRMED")} className="btn-primary">
                                    Confirm
                                </button>
                                <button onClick={() => changeStatus(b._id, "BLOCKED")} className="btn-danger">
                                    Block
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
