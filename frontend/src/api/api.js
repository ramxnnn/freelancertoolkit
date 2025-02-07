import axios from 'axios';

const API_URL = 'https://freelancer-toolkit.onrender.com';

// Fetch exchange rate for currency conversion
export const getExchangeRate = async (from, to, amount = 1) => {
  try {
    const response = await axios.get(`${API_URL}/currency?from=${from}&to=${to}&amount=${amount}`);
    return response.data;  // Returns the converted amount
  } catch (error) {
    console.error("Error fetching exchange rate:", error.message);
    throw new Error("Unable to fetch exchange rates. Please check your input or try again later.");
  }
};

// Fetch workspaces based on a location
export const getWorkspaces = async (location) => {
  try {
    const response = await axios.get(`${API_URL}/workspaces?location=${location}`);
    return response.data;  // Returns workspace results
  } catch (error) {
    console.error("Error fetching workspace data:", error.message);
    throw new Error("Unable to fetch workspaces. Please try again later.");
  }
};

// Fetch timezone based on location and timestamp
export const getTimezone = async (lat, lng, timestamp) => {
  try {
    const response = await axios.get(`${API_URL}/timezone?lat=${lat}&lng=${lng}&timestamp=${timestamp}`);
    return response.data;  // Returns timezone data
  } catch (error) {
    console.error("Error fetching timezone data:", error.message);
    throw new Error("Unable to fetch timezone data. Please try again later.");
  }
};
