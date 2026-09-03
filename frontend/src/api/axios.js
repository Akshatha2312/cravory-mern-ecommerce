import axios from "axios";

const API = axios.create({
<<<<<<< HEAD
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized request or token expired");
    }
    return Promise.reject(error);
  }
);
=======
  baseURL: "http://localhost:4000",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});
>>>>>>> f34295960f993f444ddcf4ba140c8f4aa114671d

export default API;
