import api from "./axios";

export const submitKyc = (formData) =>
  api.post("/kyc/submit", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

export const getMyKyc = () =>
  api.get("/kyc/my");

export const getMyKycStatus = () =>
  api.get("/kyc/my-status");

export const getMyKycData = async () => {
  const token = localStorage.getItem("token");
  return await axios.get(`/api/kyc/me`, { // Adjust endpoint to your backend
    headers: { Authorization: `Bearer ${token}` },
  }); 
};