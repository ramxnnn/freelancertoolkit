import axios from 'axios';

const API_URL = 'https://freelancerbackend.vercel.app'; 

// Register a new user
export const register = async (name, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      name,
      email,
      password,
    });
    return response.data; // Returns user data and token
  } catch (error) {
    console.error('Error registering user:', error.message);
    throw new Error(error.response?.data?.error || 'Registration failed. Please try again.');
  }
};

// Login user
export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });
    return response.data; // Returns user data and token
  } catch (error) {
    console.error('Error logging in:', error.message);
    throw new Error(error.response?.data?.error || 'Login failed. Please check your credentials.');
  }
};

// Fetch exchange rate for currency conversion
export const getExchangeRate = async (from, to, amount = 1) => {
  try {
    const response = await axios.get(`${API_URL}/currency?from=${from}&to=${to}&amount=${amount}`);
    return response.data; // Returns the converted amount
  } catch (error) {
    console.error('Error fetching exchange rate:', error.message);
    throw new Error('Unable to fetch exchange rates. Please check your input or try again later.');
  }
};

// Fetch workspaces based on a location
export const getWorkspaces = async (location) => {
  try {
    const response = await axios.get(`${API_URL}/workspaces?location=${location}`);
    return response.data; // Returns workspace results
  } catch (error) {
    console.error('Error fetching workspace data:', error.message);
    throw new Error('Unable to fetch workspaces. Please try again later.');
  }
};

// Fetch timezone based on location and timestamp
export const getTimezone = async (lat, lng, timestamp) => {
  try {
    const response = await axios.get(`${API_URL}/api/timezone?lat=${lat}&lng=${lng}&timestamp=${timestamp}`);
    return response.data; // Returns timezone data
  } catch (error) {
    console.error('Error fetching timezone data:', error.message);
    throw new Error('Unable to fetch timezone data. Please try again later.');
  }
};

// Fetch earnings for a project
export const getProjectEarnings = async (projectId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found. Please log in again.');
    }

    const response = await axios.get(`${API_URL}/api/projects/${projectId}/earnings`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // Returns { projectId, totalEarnings, paidInvoicesCount }
  } catch (error) {
    console.error('Error fetching project earnings:', error);
    throw new Error('Failed to fetch project earnings. Please try again.');
  }
};