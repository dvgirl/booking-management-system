import api from "./axios";

export const submitKyc = (formData) =>
  api.post("/kyc/submit", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

export const getMyKyc = () =>
  api.get("/kyc/my");

export const getMyKycStatus = () =>
  api.get("/kyc/my-status");