require("dotenv").config();

const express = require("express");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require("axios");
const cors = require('cors');
const path = require("path");
const jwt = require('jsonwebtoken'); // Add JWT for token validation
const currency = require("./modules/api/currency");
const places = require("./modules/api/places");
const Invoice = require("./models/Invoice");
const timezone = require("./modules/api/timezone");
const mongoURI = process.env.MONGODB_URI;
const authRoutes = require("./routes/authRoutes");
const Task = require('./models/Task'); // Import the Task model
const User = require('./models/User'); // Import the User model
const Project = require('./models/Projects'); // Import Project model
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
  credentials: true // Allow credentials (cookies, tokens)
}));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Auth Routes
app.use(authRoutes);

// Token Validation Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Get the token from the header
  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user; // Attach the user to the request object
    next(); // Proceed to the next middleware/route
  });
};

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
app.post('/tasks', authenticateToken, async (req, res) => {
  try {
    const { title, description, dueDate, status, priority, category, reminder } = req.body;
    const task = new Task({ userId: req.user._id, title, description, dueDate, status, priority, category, reminder });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
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
app.post('/workspaces', authenticateToken, async (req, res) => {
  try {
    const { placeId, name, address, latitude, longitude, rating } = req.body;
    const workspace = new Workspace({ userId: req.user._id, placeId, name, address, latitude, longitude, rating });
    await workspace.save();
    res.status(201).json(workspace);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/workspaces', authenticateToken, async (req, res) => {
  try {
    const workspaces = await Workspace.find({ userId: req.user._id });
    res.json(workspaces);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/workspaces/:id', authenticateToken, async (req, res) => {
  try {
    await Workspace.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Workspace deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Currency Conversion History Routes
app.post('/currency-conversions', authenticateToken, async (req, res) => {
  try {
    const { fromCurrency, toCurrency, amount, convertedAmount, rate } = req.body;
    const currencyConversion = new CurrencyConversion({ userId: req.user._id, fromCurrency, toCurrency, amount, convertedAmount, rate });
    await currencyConversion.save();
    res.status(201).json(currencyConversion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/currency-conversions', authenticateToken, async (req, res) => {
  try {
    const currencyConversions = await CurrencyConversion.find({ userId: req.user._id });
    res.json(currencyConversions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Invoice
app.post('/invoices', authenticateToken, async (req, res) => {
  try {
    const { clientName, services, amount, dueDate, status } = req.body;
    const invoice = new Invoice({ userId: req.user._id, clientName, services, amount, dueDate, status });
    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get Invoices for a User
app.get('/invoices', authenticateToken, async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user._id });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Import and use the projects routes
const projectsRoutes = require('./routes/projects');
app.use(projectsRoutes);

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});