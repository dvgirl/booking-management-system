import api from "./axios";

export const createPayment = (data) =>
    api.post("/transactions/payment", data);

export const createRefund = (data) =>
    api.post("/transactions/refund", data);

export const getTransactions = () =>
    api.get("/transactions");

export const getTransactionById = (id) =>
    api.get(`/transactions/${id}`);

export const getReconciliation = () =>
    api.get("/transactions/reconciliation");


export const uploadProof = (id, formData) =>
    api.post(`/transactions/proof/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });

export const verifyTransaction = (id) => api.patch(`/transactions/verify/${id}`);

export const lockTransaction = (id) => api.patch(`/transactions/lock/${id}`);


export const initiateCashfreePayment = (data) => 
    api.post('/transactions/initiateCashfreePayment' , data)


export const verifyCashfreePayment = (data) => 
    api.post('/transactions/verifyCashfreePayment' , data)