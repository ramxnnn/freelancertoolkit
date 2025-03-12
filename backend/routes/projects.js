const express = require('express');
const axios = require('axios');
const Project = require('../models/Projects');
const router = express.Router();
const jwt = require('jsonwebtoken');
const projectController = require('../controllers/projectController');
require('dotenv').config();

const EXCHANGE_API_KEY = process.env.EXCHANGE_API_KEY;
const PLACES_API_KEY = process.env.PLACES_API_KEY;

// Token Validation Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user; // Attach the user to the request object
    next(); // Proceed to the next middleware/route
  });
};

// Fetch Timezone based on coordinates
const getTimezone = async (location) => {
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/timezone/json`, {
      params: { 
        location,
        timestamp: Math.floor(Date.now() / 1000), // Use current timestamp
        key: PLACES_API_KEY,
      },
    });
    return response.data.timeZoneId;
  } catch (error) {
    console.error('Error fetching timezone:', error);
    return null;
  }
};

// Fetch Currency Conversion Rate
const getCurrencyConversion = async (currency) => {
  try {
    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/USD`
    );
    return response.data.conversion_rates[currency] || null;
  } catch (error) {
    console.error('Error fetching currency conversion:', error);
    return null;
  }
};

// Route to fetch location coordinates
router.get('/location', authenticateToken, async (req, res) => {
  const { city } = req.query;

  if (!city) {
    return res.status(400).json({ error: 'City name is required.' });
  }

  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/findplacefromtext/json',
      {
        params: {
          input: city,
          inputtype: 'textquery',
          fields: 'geometry',
          key: PLACES_API_KEY,
        },
      }
    );

    if (response.data.status !== 'OK' || !response.data.candidates?.length) {
      return res.status(400).json({ error: 'Location not found' });
    }

    const { lat, lng } = response.data.candidates[0].geometry.location;
    res.json({ lat, lng });
  } catch (error) {
    console.error('Error fetching location data:', error.message);
    res.status(500).json({ error: 'Failed to fetch location data' });
  }
});

// Create a Project (Protected Route)
router.post('/projects', authenticateToken, async (req, res) => {
  const { name, status, dueDate, location: city, currency } = req.body;

  try {
    // Step 1: Convert city name to coordinates
    const geocodeResponse = await axios.get(
      'https://maps.googleapis.com/maps/api/place/findplacefromtext/json',
      {
        params: {
          input: city,
          inputtype: 'textquery',
          fields: 'geometry',
          key: PLACES_API_KEY,
        },
      }
    );

    if (geocodeResponse.data.status !== 'OK' || !geocodeResponse.data.candidates?.length) {
      return res.status(400).json({ message: 'Failed to find location' });
    }

    const { lat, lng } = geocodeResponse.data.candidates[0].geometry.location;
    const coordinates = `${lat},${lng}`;

    // Step 2: Get timezone using coordinates
    const timezone = await getTimezone(coordinates);
    if (!timezone) return res.status(400).json({ message: 'Failed to get timezone' });

    // Step 3: Get currency conversion rate
    const conversionRate = await getCurrencyConversion(currency);
    if (!conversionRate) return res.status(400).json({ message: 'Invalid currency' });

    // Step 4: Create the project
    const newProject = new Project({
      name,
      status,
      dueDate,
      location: city, // Store city name
      currency,
      timezone,
      userId: req.user._id,
      conversionRate,
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    console.error('Project creation error:', error);
    res.status(500).json({ 
      message: 'Error creating project',
      error: error.message,
    });
  }
});

// Get All Projects for the Logged-in User (Protected Route)
router.get('/projects', authenticateToken, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error });
  }
});

// Delete a Project (Protected Route)
router.delete('/projects/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.status(200).json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error });
  }
});

// Calculate Earnings for a Project (Protected Route)
router.get('/projects/:projectId/earnings', authenticateToken, projectController.calculateEarnings);

module.exports = router;