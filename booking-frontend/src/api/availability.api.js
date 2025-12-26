import api from "./axios";

export const checkAvailability = (checkIn, checkOut) =>
  api.get("/bookings/availability", {
    params: { checkIn, checkOut }
  });

export const confirmBooking = (id) =>
  api.patch(`/bookings/${id}/confirm`);

export const updateBookingStatus = (id, status) =>
  api.patch(`/bookings/${id}/status`, { status });
