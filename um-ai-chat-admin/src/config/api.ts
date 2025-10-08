// Use environment variable or fallback to default IP
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.254.119:5050";

export default API_BASE_URL;
