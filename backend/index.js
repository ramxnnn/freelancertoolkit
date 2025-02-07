const express = require("express");
const dotenv = require("dotenv");
const axios = require("axios");
const cors = require('cors'); // Import cors package
const path = require("path");
const currency = require("./modules/api/currency");
const places = require("./modules/api/places");
const timezone = require("./modules/api/timezone");

dotenv.config();
const app = express();
const port = process.env.PORT || 8888;

// Setup Pug as the view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));

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

// Routes
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

  const converted = await currency.getExchangeRates(from, to, amountValue);  // Call the currency conversion logic for the API
  return res.json({
    convertedAmount: converted,
  });
});

// Existing route for the Workspace Locator
app.get("/workspaces", async (req, res) => {
  const location = req.query.location || "Toronto";  // Default to Toronto if no location is provided here
  const workspaces = await places.findWorkspaces(location);
  res.json(workspaces);  // Return all the workspaces as JSON format
});

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

// Start Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
