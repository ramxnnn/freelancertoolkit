const express = require('express');
const axios = require('axios');
const Project = require('../models/Projects');
const router = express.Router();
const jwt = require('jsonwebtoken');
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

// Fetch Timezone based on location
const getTimezone = async (location) => {
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/timezone/json`, {
      params: { location, timestamp: Date.now() / 1000, key: PLACES_API_KEY },
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
    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/USD`);
    return response.data.rates[currency] || null;
  } catch (error) {
    console.error('Error fetching currency conversion:', error);
    return null;
  }
};

// Create a Project (Protected Route)
router.post('/projects', authenticateToken, async (req, res) => {
  const { name, status, dueDate, location, currency } = req.body;
  try {
    const timezone = await getTimezone(location);
    if (!timezone) return res.status(400).json({ message: 'Failed to get timezone' });

    const conversionRate = await getCurrencyConversion(currency);
    if (!conversionRate) return res.status(400).json({ message: 'Failed to get currency conversion rate' });

    const newProject = new Project({ name, status, dueDate, location, currency, timezone, userId: req.user._id });
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error });
  }
});

// Get All Projects for the Logged-in User (Protected Route)
router.get('/projects', authenticateToken, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id }); // Fetch projects for the logged-in user
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

module.exports = router;