const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Register Route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ token, user: { _id: user._id, name, email } });
  } catch (error) {
    console.error("Register error:", error); // Log the error
    res.status(500).json({ error: "Server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    console.log("Found user:", user); // Log the found user for debugging
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Compare passwords
    console.log("Password:", password); // Log the plain password for debugging
    console.log("Hashed Password:", user.password); // Log the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isMatch); // Log the result of the password comparison

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user: { _id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Login error:", error); // Log the error for debugging
    res.status(500).json({ error: "Server error" });
  }
});

// Protected Route (Check if user is authenticated)
router.get("/protected", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Protected route error:", error); // Log the error for debugging
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
