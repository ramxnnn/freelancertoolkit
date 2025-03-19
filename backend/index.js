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

dotenv.config();
const app = express();
const port = process.env.PORT || 8888;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Error connecting to MongoDB Atlas:', err));

  app.use(cors({
    origin: [
      'https://freelancertoolkit.vercel.app', 
      'https://freelancer-toolkit-frontend-react.vercel.app',
      'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(authRoutes);

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get("/", (req, res) => {
  res.render("index", { title: "Freelancer Toolkit" });
});

app.get("/currency", async (req, res) => {
  const { from, to, amount } = req.query;

  if (!from || !to || !amount) {
    return res.json({
      convertedAmount: null,
      error: "Please provide both 'from' and 'to' currencies and an amount."
    });
  }

  const amountValue = parseFloat(amount) || 1;

  const converted = await currency.getExchangeRates(from, to, amountValue);
  return res.json({
    convertedAmount: converted,
  });
});

app.get("/workspaces", async (req, res) => {
  const location = req.query.location || "Toronto";
  const workspaces = await places.findWorkspaces(location);
  res.json(workspaces);
});

app.get("/api/timezones", async (req, res) => {
  const { location } = req.query;

  if (!location) {
    return res.json({
      error: "Please enter a location to find its timezone.",
    });
  }

  const placesUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(location)}&inputtype=textquery&fields=geometry&key=${process.env.PLACES_API_KEY}`;
  const placesResponse = await axios.get(placesUrl);

  if (!placesResponse.data.candidates || placesResponse.data.candidates.length === 0) {
    return res.json({
      error: `No results found for "${location}".`,
    });
  }

  const { lat, lng } = placesResponse.data.candidates[0].geometry.location;
  const timestamp = Math.floor(Date.now() / 1000);
  const tz = await timezone.getTimezone(lat, lng, timestamp);

  return res.json({
    timeZoneId: tz.timeZoneId,
    timeZoneName: tz.timeZoneName,
    dstOffset: tz.dstOffset,
    rawOffset: tz.rawOffset,
  });
});

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

app.post('/invoices', authenticateToken, invoiceController.createInvoice);
app.get('/invoices', authenticateToken, invoiceController.getInvoices);

const projectsRoutes = require('./routes/projects');
app.use('/api', projectsRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});