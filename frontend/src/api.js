import axios from "axios";

const API = axios.create({
  baseURL: "https://docsign-backend-xnsr.onrender.com/api"
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const uploadDocument = (data) => API.post("/upload", data);
export const getDocuments = () => API.get("/upload/documents");