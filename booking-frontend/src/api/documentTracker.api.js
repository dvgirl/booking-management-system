import api from "./axios";

export const uploadDocument = (data) =>
    api.post("/documents/upload", data);

export const getBookingDocuments = (bookingId) =>
    api.get(`/documents/booking/${bookingId}`);

export const getAllDocuments = () =>
    api.get("/documents/all");

export const verifyDocument = (id, data) =>
    api.patch(`/documents/verify/${id}`, data);