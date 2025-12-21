import api from '../lib/axios';

const authService = {
  // Login User
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Register User
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Get Current User Profile (Protected Route)
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
  },
};

export default authService;