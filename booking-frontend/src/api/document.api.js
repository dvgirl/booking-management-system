import api from "./axios";

// Generate booking document
export const generateDocument = (bookingId) =>
    api.post(`/documents/generate/${bookingId}`, {}, { responseType: "blob" });

// Upload manual document
export const uploadDocument = (formData) =>
    api.post("/document-tracker/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });

// List documents for a booking
export const getBookingDocuments = (bookingId) =>
    api.get("/document-tracker", { params: { bookingId } });

// ✅ NEW: Get document by ID
export const getDocumentById = (id) =>
    api.get(`/document-tracker/${id}`);

// ✅ NEW: Verify document
export const verifyDocument = (id) =>
    api.patch(`/document-tracker/${id}/verify`);

// ✅ NEW: Lock document permanently
export const lockDocument = (id) =>
    api.patch(`/document-tracker/${id}/lock`);

// ✅ NEW: Get all documents (for admin/master view)    
export const getAllDocuments = () => 
    api.get("/document-tracker/list");