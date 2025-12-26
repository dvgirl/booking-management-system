import api from "./axios";

export const createTransaction = (data) =>
    api.post("/payments/transaction", data);

export const createRazorpayOrder = (data) =>
    api.post("/payments/razorpay/order", data);

export const verifyRazorpay = (data) =>
    api.post("/payments/razorpay/verify", data);

export const uploadOfflineProof = (id, formData) =>
    api.post(`/payments/${id}/proof`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });

export const refundPayment = (data) =>
    api.post("/payments/refund", data);
