// Use environment variable or fallback to default IP
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://172.20.10.12:5050";

export default API_BASE_URL;
