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
    const { name, email, password, role = 'user' } = req.body; // Default role is 'user'

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with role
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    // Generate a JWT token with role included
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role // Include role in token
      }, 
      JWT_SECRET, 
      { expiresIn: "7d" }
    );

    res.status(201).json({ 
      token, 
      user: { 
        _id: user._id, 
        name, 
        email,
        role: user.role // Include role in response
      } 
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Generate a JWT token with role included
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role // Include role in token
      }, 
      JWT_SECRET, 
      { expiresIn: "7d" }
    );

    res.json({ 
      token, 
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role // Include role in response
      } 
    });
  } catch (error) {
    console.error("Login error:", error);
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

    res.json({ 
      user: {
        ...user.toObject(),
        role: user.role // Include role from token
      }
    });
  } catch (error) {
    console.error("Protected route error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;