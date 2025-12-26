import api from "./axios";

export const getAllBookings = () =>
    api.get("/inventory/bookings");

export const updateBooking = (id, data) =>
    api.patch(`/inventory/bookings/${id}`, data);

export const cancelBooking = (id, reason) =>
    api.post(`/inventory/bookings/${id}/cancel`, { reason });

export const getChangeHistory = (id) =>
    api.get(`/inventory/bookings/${id}/history`);
