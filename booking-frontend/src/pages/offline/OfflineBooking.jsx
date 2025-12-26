import { saveDraft } from "../../offline/offline.service";
import { v4 as uuid } from "uuid";

export default function OfflineBooking() {
    const save = async () => {
        await saveDraft("draftBookings", {
            id: uuid(),
            guestName: "Offline Guest",
            room: "12",
            status: "DRAFT"
        });

        alert("Booking saved offline");
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold">Offline Booking</h2>
            <button onClick={save} className="btn-primary mt-4">
                Save Draft Booking
            </button>
        </div>
    );
}
