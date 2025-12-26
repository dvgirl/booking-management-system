import api from "./axios";

export const addPhysicalID = (data) =>
    api.post("/physicalID", data);

export const getAllPhysicalIDs = () =>
    api.get("/physicalID");

export const getPhysicalIDByBooking = (bookingId) =>
    api.get(`/physicalID/booking/${bookingId}`);
