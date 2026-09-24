import axios from "axios";

const api = axios.create({
    baseURL: "http://52.66.236.4:8000",
});

// ==========================================
// AUTOMATIC JWT AUTHORIZATION
// ==========================================

api.interceptors.request.use(
    (config) => {

        if (typeof window !== "undefined") {

            const token =
                localStorage.getItem("access_token");

            if (token) {

                config.headers.Authorization =
                    `Bearer ${token}`;

            }

        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);

export default api;