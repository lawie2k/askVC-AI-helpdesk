// Use environment variable or fallback to deployed backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://askvc-backend-0b6f10fad280.herokuapp.com";

export default API_BASE_URL;
