import api from "./axios";

export const createVirtualAccount = (data) =>
    api.post("/admin/virtual-accounts", data);

export const getVirtualAccounts = () =>
    api.get("/admin/virtual-accounts");

export const createRoom = (data) =>
    api.post("/rooms", data);

export const getRooms = () =>
    api.get("/rooms");

export const updateRoom = (id, data) =>
    api.put(`/rooms/${id}`, data);

export const deleteRoom = (id) =>
    api.delete(`/rooms/${id}`);

export const createAmenity = (data) =>
    api.post("/admin/amenities", data);

export const getAmenities = () =>
    api.get("/admin/amenities");

export const blockFacility = (data) =>
    api.post("/admin/facility-block", data);


export const getUsers = () =>
    api.get("/admin/virtual-accounts/users");

export const assignAdmin = (data) =>
    api.post("/admin/virtual-accounts/assign-admin", data);

export const getHotels = () => api.get("/hotels");
export const createHotel = (data) => api.post("/hotels", data);
export const updateHotel = (id, data) => api.put(`/hotels/${id}`, data);
export const deleteHotel = (id) => api.delete(`/hotels/${id}`);
export const getManagers = () =>
    api.get("/hotels/available-managers");