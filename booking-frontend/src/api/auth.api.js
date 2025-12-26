import api from "./axios";

export const sendOtp = (data) =>
  api.post("/auth/send-otp", data);

export const verifyOtp = (data) =>
  api.post("/auth/verify-otp", data);
