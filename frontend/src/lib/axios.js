import axios from 'axios';

// Create a configured instance of axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach the Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If server says "Unauthorized", clear storage (optional: redirect to login)
      // We avoid auto-redirect here to prevent loops, handled in Context instead
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;