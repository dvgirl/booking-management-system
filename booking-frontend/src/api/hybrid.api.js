import api from "./axios";

export const syncBooking = (data) => api.post("/hybrid/bookings", data);
export const syncPayment = (data) => api.post("/hybrid/payments", data);
export const getOnlineBookings = () => api.get("/hybrid/bookings");
export const getOnlinePayments = () => api.get("/hybrid/payments");
