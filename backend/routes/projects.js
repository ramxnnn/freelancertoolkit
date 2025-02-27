const express = require('express');
const axios = require('axios');
const Project = require('../models/Project');
const router = express.Router();
require('dotenv').config();

const EXCHANGE_API_KEY = process.env.EXCHANGE_API_KEY;
const PLACES_API_KEY = process.env.PLACES_API_KEY;

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

// Create a Project
router.post('/projects', async (req, res) => {
  const { name, status, dueDate, location, currency } = req.body;
  try {
    const timezone = await getTimezone(location);
    if (!timezone) return res.status(400).json({ message: 'Failed to get timezone' });

    const conversionRate = await getCurrencyConversion(currency);
    if (!conversionRate) return res.status(400).json({ message: 'Failed to get currency conversion rate' });

    const newProject = new Project({ name, status, dueDate, location, currency, timezone });
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error });
  }
});

// Get All Projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error });
  }
});

// Delete a Project
router.delete('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.status(200).json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error });
  }
});

module.exports = router;
