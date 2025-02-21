require("dotenv").config();

const express = require("express");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require("axios");
const cors = require('cors');
const path = require("path");
const currency = require("./modules/api/currency");
const places = require("./modules/api/places");
const timezone = require("./modules/api/timezone");
const mongoURI = process.env.MONGODB_URI;
const authRoutes = require("./routes/authRoutes");
const Task = require('./models/Task'); // Import the Task model
const User = require('./models/User'); // Import the User model
const Workspace = require('./models/Workspace'); // Import the Workspace model
const CurrencyConversion = require('./models/CurrencyConversion'); // Import the CurrencyConversion model

dotenv.config();
const app = express();
const port = process.env.PORT || 8888;


// Setup Pug as the view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

// Setup MongoDB
mongoose.connect(mongoURI)
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

// Enable CORS middleware for multiple frontend origins
app.use(cors({
  origin: [
    'https://freelancer-toolkit-frontend-react.vercel.app',  // Vercel Frontend
    'http://localhost:5173',  // Localhost Frontend
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Auth Routes
app.use(authRoutes);

// Routes
app.get("/", (req, res) => {
  res.render("index", { title: "Freelancer Toolkit" });
});

// Currency Conversion
app.get("/currency", async (req, res) => {
  const { from, to, amount } = req.query;

  if (!from || !to || !amount) {
    return res.json({
      convertedAmount: null,
      error: "Please provide both 'from' and 'to' currencies and an amount."
    });
  }

  const amountValue = parseFloat(amount) || 1;

  const converted = await currency.getExchangeRates(from, to, amountValue);  // Call the currency conversion logic for the API
  return res.json({
    convertedAmount: converted,
  });
});

// Workspace Locator
app.get("/workspaces", async (req, res) => {
  const location = req.query.location || "Toronto";  // Default to Toronto if no location is provided here
  const workspaces = await places.findWorkspaces(location);
  res.json(workspaces);  // Return all the workspaces as JSON format
});

// Timezone
app.get("/api/timezones", async (req, res) => {
  const { location } = req.query; // Get location from query

  if (!location) {
    return res.json({
      error: "Please enter a location to find its timezone.",
    });
  }

  const placesUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(location)}&inputtype=textquery&fields=geometry&key=${process.env.PLACES_API_KEY}`;
  const placesResponse = await axios.get(placesUrl);

  if (
    !placesResponse.data.candidates ||
    placesResponse.data.candidates.length === 0
  ) {
    return res.json({
      error: `No results found for "${location}".`,
    });
  }

  const { lat, lng } = placesResponse.data.candidates[0].geometry.location;

  // Fetch timezone data using the coordinates
  const timestamp = Math.floor(Date.now() / 1000); // Current timestamp
  const tz = await timezone.getTimezone(lat, lng, timestamp);

  return res.json({
    timeZoneId: tz.timeZoneId,
    timeZoneName: tz.timeZoneName,
    dstOffset: tz.dstOffset,
    rawOffset: tz.rawOffset,
  });
});

// Task Manager Routes
app.post('/tasks', async (req, res) => {
  try {
    const { userId, title, description, dueDate, status, priority, category, reminder } = req.body;
    const task = new Task({ userId, title, description, dueDate, status, priority, category, reminder });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/tasks/:userId', async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.params.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Management Routes
app.post('/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Workspace Management Routes
app.post('/workspaces', async (req, res) => {
  try {
    const { userId, placeId, name, address, latitude, longitude, rating } = req.body;
    const workspace = new Workspace({ userId, placeId, name, address, latitude, longitude, rating });
    await workspace.save();
    res.status(201).json(workspace);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/workspaces/:userId', async (req, res) => {
  try {
    const workspaces = await Workspace.find({ userId: req.params.userId });
    res.json(workspaces);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/workspaces/:id', async (req, res) => {
  try {
    await Workspace.findByIdAndDelete(req.params.id);
    res.json({ message: 'Workspace deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Currency Conversion History Routes
app.post('/currency-conversions', async (req, res) => {
  try {
    const { userId, fromCurrency, toCurrency, amount, convertedAmount, rate } = req.body;
    const currencyConversion = new CurrencyConversion({ userId, fromCurrency, toCurrency, amount, convertedAmount, rate });
    await currencyConversion.save();
    res.status(201).json(currencyConversion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/currency-conversions/:userId', async (req, res) => {
  try {
    const currencyConversions = await CurrencyConversion.find({ userId: req.params.userId });
    res.json(currencyConversions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});