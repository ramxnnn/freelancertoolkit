require("dotenv").config();

const express = require("express");
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require("axios");
const cors = require('cors');
const path = require("path");
const jwt = require('jsonwebtoken');
const currency = require("./modules/api/currency");
const places = require("./modules/api/places");
const Invoice = require("./models/Invoice");
const timezone = require("./modules/api/timezone");
const mongoURI = process.env.MONGODB_URI;
const authRoutes = require("./routes/authRoutes");
const Task = require('./models/Task');
const User = require('./models/User');
const Project = require('./models/Projects');
const Workspace = require('./models/Workspace');
const CurrencyConversion = require('./models/CurrencyConversion');
const invoiceController = require("./controllers/invoiceController");
const adminRoutes = require("./routes/admin");
const projectsRoutes = require('./routes/projects');

dotenv.config();
const app = express();
const port = process.env.PORT || 8888;

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

// Database connection
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

// CORS configuration
app.use(cors({
  origin: [
    'https://freelancertoolkit.vercel.app',
    'http://localhost:5173',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors());

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Authorization token required" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  });
};

// Public routes
app.use(authRoutes);

// Home route
app.get("/", (req, res) => {
  res.render("index", { title: "Freelancer Toolkit" });
});

// Public API routes
app.get("/currency", async (req, res) => {
  try {
    const { from, to, amount } = req.query;
    if (!from || !to || !amount) {
      return res.status(400).json({
        error: "Please provide both 'from' and 'to' currencies and an amount"
      });
    }
    const converted = await currency.getExchangeRates(from, to, parseFloat(amount) || 1);
    res.json({ convertedAmount: converted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/workspaces", async (req, res) => {
  try {
    const location = req.query.location || "Toronto";
    const workspaces = await places.findWorkspaces(location);
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/timezones", async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) {
      return res.status(400).json({
        error: "Please enter a location to find its timezone."
      });
    }

    const placesUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(location)}&inputtype=textquery&fields=geometry&key=${process.env.PLACES_API_KEY}`;
    const placesResponse = await axios.get(placesUrl);

    if (!placesResponse.data.candidates || placesResponse.data.candidates.length === 0) {
      return res.status(404).json({
        error: `No results found for "${location}".`
      });
    }

    const { lat, lng } = placesResponse.data.candidates[0].geometry.location;
    const timestamp = Math.floor(Date.now() / 1000);
    const tz = await timezone.getTimezone(lat, lng, timestamp);

    res.json({
      timeZoneId: tz.timeZoneId,
      timeZoneName: tz.timeZoneName,
      dstOffset: tz.dstOffset,
      rawOffset: tz.rawOffset,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Protected routes
app.use("/admin", authenticateToken, adminRoutes);
app.use("/api", authenticateToken, projectsRoutes);

// Task routes
app.post('/tasks', authenticateToken, async (req, res) => {
  try {
    const task = new Task({ userId: req.user.userId, ...req.body });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/tasks/:id', authenticateToken, async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User management (admin-only)
app.post('/users', authenticateToken, async (req, res) => {
  try {
    // Only allow admins to create users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }
    
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Workspace routes
app.post('/workspaces', authenticateToken, async (req, res) => {
  try {
    const workspace = new Workspace({ userId: req.user.userId, ...req.body });
    await workspace.save();
    res.status(201).json(workspace);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/workspaces', authenticateToken, async (req, res) => {
  try {
    const workspaces = await Workspace.find({ userId: req.user.userId });
    res.json(workspaces);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/workspaces/:id', authenticateToken, async (req, res) => {
  try {
    await Workspace.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    res.json({ message: 'Workspace deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Currency conversion routes
app.post('/currency-conversions', authenticateToken, async (req, res) => {
  try {
    const conversion = new CurrencyConversion({ 
      userId: req.user.userId, 
      ...req.body 
    });
    await conversion.save();
    res.status(201).json(conversion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/currency-conversions', authenticateToken, async (req, res) => {
  try {
    const conversions = await CurrencyConversion.find({ userId: req.user.userId });
    res.json(conversions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Invoice routes
app.post('/invoices', authenticateToken, invoiceController.createInvoice);
app.get('/invoices', authenticateToken, invoiceController.getInvoices);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});