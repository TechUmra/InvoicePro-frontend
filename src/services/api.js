import axios from "axios";

const API = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL ||
        "https://invoicepro-backend-1.onrender.com/api",

    headers: {
        "Content-Type": "application/json",
    },
});

API.interceptors.request.use(
    (config) => {
        console.log("API REQUEST:", config.method, config.baseURL + config.url);

        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },

    (error) => {
        console.error("API REQUEST ERROR:", error);
        return Promise.reject(error);
    }
);

API.interceptors.response.use(
    (response) => {
        console.log("API RESPONSE:", response.status, response.config.url);
        return response;
    },

    (error) => {
        console.error("API RESPONSE ERROR:", error);
        console.error("ERROR MESSAGE:", error.message);
        console.error("ERROR CODE:", error.code);
        console.error("ERROR URL:", error.config?.url);

        return Promise.reject(error);
    }
);

export default API;