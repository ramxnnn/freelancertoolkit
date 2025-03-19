import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('https://freelancerbackend.vercel.app/protected', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data.user); // Set user if token is valid
        } else {
          setUser(null); // No token means no user
        }
      } catch (error) {
        // Handle token expiry or any other error (e.g. unauthorized)
        console.error('Authentication check failed:', error);
        localStorage.removeItem('token'); // Remove invalid token
        setUser(null); // Reset user state on failure
      } finally {
        setIsLoading(false); // Make sure loading is set to false after auth check
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('https://freelancerbackend.vercel.app/login', { email, password });
      localStorage.setItem('token', response.data.token); // Save token to localStorage
      setUser(response.data.user); // Set the user in the state
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error.response?.data?.error || 'Login failed.');
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('https://freelancerbackend.vercel.app/register', { name, email, password });
      localStorage.setItem('token', response.data.token); // Save token to localStorage
      setUser(response.data.user); // Set the user in the state
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(error.response?.data?.error || 'Registration failed.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    setUser(null); // Reset user state
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
