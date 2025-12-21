import { createContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/axios'; // Ensure this points to your axios instance

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Verify token is valid by fetching profile
          // This ensures we don't keep a user logged in with an expired token
          const { data } = await api.get('/users/profile');
          setUser(data);
        } catch (error) {
          console.error("Session expired or invalid token:", error);
          localStorage.removeItem('token'); // Clear bad token
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // 2. Login Action
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/users/login', { email, password });
      
      // CRITICAL: Save token to Local Storage so axios can find it later
      localStorage.setItem('token', data.token);
      
      setUser(data);
      toast.success(`Welcome back, ${data.name}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // 3. Register Action
  const register = async (name, email, password) => {
    try {
      const { data } = await api.post('/users/register', { name, email, password });
      
      // CRITICAL: Save token immediately after registering
      localStorage.setItem('token', data.token);
      
      setUser(data);
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // 4. Logout Action
  const logout = () => {
    localStorage.removeItem('token'); // Destroy token
    setUser(null);
    toast.success('Logged out successfully');
    
    // Optional: Redirect to login or home if not handled by components
    // window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAuthenticated: !!user }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;