import api from "./axios";

export const createProcess = (data) =>
    api.post("/process", data);

export const getProcesses = (status) =>
    api.get("/process", {
      params: status ? { status } : {}
    });

export const getProcessById = (id) =>
    api.get(`/process/${id}`);

export const updateProcess = (id, data) =>
    api.put(`/process/${id}`, data);

export const getProcessStats = () =>
    api.get("/process/dashboard");
