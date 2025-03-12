import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Card from './Card';
import Button from './Button';
import Input from './Input';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Pending');
  const [dueDate, setDueDate] = useState('');
  const [city, setCity] = useState(''); // City name instead of lat,long
  const [currency, setCurrency] = useState('');
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  // Use the environment variable for the API base URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888';

  // Google Timezone API key
  const GOOGLE_TIMEZONE_API_KEY = import.meta.env.VITE_GOOGLE_TIMEZONE_API_KEY;
  const GOOGLE_TIMEZONE_API_URL = `https://maps.googleapis.com/maps/api/timezone/json`;

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in again.');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to fetch projects. Please try again.');
    }
  };

  const getLatLongFromCity = async (cityName) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in again.');
      }

      const response = await axios.get(`${API_BASE_URL}/location`, {
        params: { city: cityName },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; // { lat, lng }
    } catch (error) {
      console.error('Error fetching location:', error);
      throw new Error('Failed to fetch location.');
    }
  };

  const getTimezone = async (lat, lng) => {
    try {
      const timestamp = Math.floor(Date.now() / 1000); // Current timestamp in seconds
      const response = await axios.get(GOOGLE_TIMEZONE_API_URL, {
        params: {
          location: `${lat},${lng}`,
          timestamp: timestamp,
          key: GOOGLE_TIMEZONE_API_KEY,
        },
      });

      if (response.data.status !== 'OK') {
        throw new Error('Failed to fetch timezone.');
      }

      return response.data.timeZoneId; // Return the timezone ID (e.g., "America/New_York")
    } catch (error) {
      console.error('Error fetching timezone:', error);
      throw new Error('Failed to fetch timezone.');
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in again.');
        return;
      }

      // Step 1: Get latitude and longitude from city name
      const { lat, lng } = await getLatLongFromCity(city);

      // Step 2: Get timezone from latitude and longitude
      const timezone = await getTimezone(lat, lng);

      // Step 3: Create the project with the fetched timezone
      const response = await axios.post(
        `${API_BASE_URL}/projects`,
        {
          name,
          status,
          dueDate,
          location: city, // Store the city name instead of lat,long
          currency,
          timezone, // Add the fetched timezone
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProjects([...projects, response.data]);
      setName('');
      setStatus('Pending');
      setDueDate('');
      setCity('');
      setCurrency('');
      setError('');
    } catch (error) {
      console.error('Error creating project:', error);
      setError(error.message || 'Failed to create project. Please try again.');
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in again.');
        return;
      }

      await axios.delete(`${API_BASE_URL}/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProjects(projects.filter((project) => project._id !== projectId));
      setError('');
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Projects</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <Card className="p-6 mb-6">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <Input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <Input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">Create Project</Button>
        </form>
      </Card>
      <ul className="space-y-4">
        {projects.map((project) => (
          <li key={project._id} className="border p-4 rounded-lg bg-gray-50">
            <h5 className="text-xl font-bold">{project.name}</h5>
            <p className="text-gray-700">Status: {project.status}</p>
            <p className="text-gray-700">Due Date: {new Date(project.dueDate).toLocaleDateString()}</p>
            <p className="text-gray-700">Location: {project.location}</p>
            <p className="text-gray-700">Currency: {project.currency}</p>
            <p className="text-gray-700">Timezone: {project.timezone}</p>
            <Button
              variant="secondary"
              onClick={() => handleDeleteProject(project._id)}
              className="mt-2"
            >
              Delete Project
            </Button>
            {/* Add this button to view earnings */}
            <Button
              variant="primary"
              onClick={() => window.location.href = `/dashboard`} // Redirect to dashboard
              className="mt-2"
            >
              View Earnings
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Projects;