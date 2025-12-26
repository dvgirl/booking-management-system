import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => {
        // Show success toast for POST, PUT, PATCH, DELETE requests
        if (response.config.method !== "get" && response.data?.message) {
            toast.success(response.data.message);
        }
        return response;
    },
    (error) => {
        // Handle error responses
        if (error.response) {
            const message = error.response.data?.message || "An error occurred";
            
            // Don't show toast for 401 (unauthorized) - handled by auth
            if (error.response.status === 401) {
                // Redirect to login if unauthorized
                if (window.location.pathname !== "/login") {
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                }
            } else if (error.response.status === 404) {
                toast.error("Resource not found");
            } else if (error.response.status >= 500) {
                toast.error("Server error. Please try again later.");
            } else {
                toast.error(message);
            }
        } else if (error.request) {
            toast.error("Network error. Please check your connection.");
        } else {
            toast.error("An unexpected error occurred");
        }
        
        return Promise.reject(error);
    }
);

export default api;
