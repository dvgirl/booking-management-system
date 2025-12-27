import api from "./axios";

// Get all bookings for calendar view
export const getBookings = () =>
  api.get("/bookings/calendar");

// Check availability
export const checkAvailability = (checkIn, checkOut) =>
  api.get("/bookings/availability", {
    params: { checkIn, checkOut }
  });

// Create booking
export const createBooking = (data) =>
  api.post("/bookings", data);

// Create online booking
export const createOnlineBooking = (data) =>
  api.post("/bookings/online", data);

// Create admin booking
export const createAdminBooking = (data) =>
  api.post("/bookings/admin", data);

// Create offline booking
export const createOfflineBooking = (data) =>
  api.post("/bookings/offline", data);

// Modify booking
export const modifyBooking = (id, data) =>
  api.patch(`/bookings/${id}/modify`, data);

// Cancel booking
export const cancelBooking = (id) =>
  api.patch(`/bookings/${id}/cancel`);

// Check in
export const checkIn = (id) =>
  api.patch(`/bookings/${id}/check-in`);

// Check out
export const checkOut = (id) =>
  api.patch(`/bookings/${id}/check-out`);

// Physical check in
export const physicalCheckIn = (id, kycIds) =>
  api.patch(`/bookings/${id}/physical-checkin`, { kycIds });

// Confirm booking
export const confirmBooking = (id) =>
  api.patch(`/bookings/${id}/confirm`);

// Offline check in
export const offlineCheckIn = (id) =>
  api.patch(`/bookings/${id}/offline-checkin`);

// Attach KYC to booking
export const attachKycToBooking = (id, kycIds) =>
  api.patch(`/bookings/${id}/attach-kyc`, { kycIds });

// Validate booking
export const validateBooking = (bookingId) =>
  api.get(`/bookings/validate/${bookingId}`);


export const getPendingBookings = () =>
  api.get("/bookings/admin/pending");

// Get booking full details (User + KYC)
export const getBookingDetails = (id) =>
  api.get(`/bookings/admin/${id}`);

// Reject booking
export const rejectBooking = (id) =>
  api.patch(`/bookings/${id}/cancel`);


export const getCheckinHistory = () => {
  return api.get("/bookings/checkin-history");
};

export const updateBookingStatus = (id, status, extraData = {}) =>
  api.patch(`/bookings/${id}/status`, { status, ...extraData });


export const getBookingsByStatus = (status) =>
  api.get("/bookings/BookingsByStatus", {
    params: { status }
  });

export const getImminentCheckouts = () =>
  api.get("/bookings/imminent-checkouts");