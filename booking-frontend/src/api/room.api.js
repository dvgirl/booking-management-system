import api from "./axios";

export const getAllRooms = () =>
  api.get("/rooms");

export const getRoomById = (id) =>
  api.get(`/rooms/${id}`);


