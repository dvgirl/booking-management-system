import { getOffline, deleteOffline } from "./offline.service";
import api from "../api/hybrid.api";

export const syncAll = async () => {
    if (!navigator.onLine) return;

    const bookings = await getOffline("bookings");
    for (let b of bookings) {
        await api.syncBooking(b);
        await deleteOffline("bookings", b.id);
    }

    const payments = await getOffline("payments");
    for (let p of payments) {
        await api.syncPayment(p);
        await deleteOffline("payments", p.id);
    }
};

window.addEventListener("online", syncAll);
