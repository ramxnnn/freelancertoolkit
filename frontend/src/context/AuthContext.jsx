import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

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
          
          // Use the role from the verified backend response only
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('https://freelancerbackend.vercel.app/login', { email, password });
      localStorage.setItem('token', response.data.token);
      
      // Set user with role from the verified backend response
      setUser(response.data.user);
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error.response?.data?.error || 'Login failed.');
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post('https://freelancerbackend.vercel.app/register', { name, email, password });
      localStorage.setItem('token', response.data.token);
      
      // Set user with role from the verified backend response
      setUser(response.data.user);
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(error.response?.data?.error || 'Registration failed.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };