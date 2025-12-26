import api from "./axios";

export const searchBooking = (query) =>
    api.get(`/bookings/search`, { params: { q: query } });

export const uploadDocuments = (id, formData) =>
    api.post(`/checkin/${id}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });

export const confirmCheckIn = (id) =>
    api.patch(`/bookings/${id}/check-in`);

export const getGuestDocuments = (guestId) =>
    api.get(`/guests/${guestId}/documents`);

export const getCheckinHistory = () =>
    api.get(`/bookings/checkin-history`);