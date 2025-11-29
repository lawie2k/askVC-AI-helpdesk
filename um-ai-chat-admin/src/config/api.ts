// Use environment variable or fallback to deployed backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://askvc-ai-helpdesk.onrender.com";

export default API_BASE_URL;
