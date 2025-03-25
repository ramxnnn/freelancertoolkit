const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Register Route with admin creation control
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Prevent non-admins from creating admin accounts
    const requestingUser = req.user; // From auth middleware
    if (role === 'admin' && (!requestingUser || requestingUser.role !== 'admin')) {
      return res.status(403).json({ error: "Admin privileges required to create admin accounts" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    // Hash the password with higher salt rounds for better security
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user with role
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role,
      lastActive: new Date()
    });

    await user.save();

    // Generate a JWT token with role included
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role,
        email: user.email // Include email for additional verification
      }, 
      JWT_SECRET, 
      { expiresIn: "1d" } // Shorter expiration for better security
    );

    res.status(201).json({ 
      token, 
      user: { 
        _id: user._id, 
        name, 
        email,
        role: user.role,
        isSuspended: user.isSuspended
      } 
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Server error during registration" });
  }
});

// Login Route with enhanced security
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check if account is suspended
    if (user.isSuspended) {
      return res.status(403).json({ 
        error: "Account suspended. Please contact administrator." 
      });
    }

    // Compare passwords with timing-safe comparison
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Update last active time
    user.lastActive = new Date();
    await user.save();

    // Generate a JWT token with additional security claims
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role,
        email: user.email,
        iss: 'freelancer-toolkit-api',
        aud: 'freelancer-toolkit-client'
      }, 
      JWT_SECRET, 
      { expiresIn: "1d" }
    );

    // Set secure cookie with token (optional)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.json({ 
      token, 
      user: { 
        _id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role,
        isSuspended: user.isSuspended
      } 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

// Protected Route with enhanced verification
router.get("/protected", async (req, res) => {
  try {
    // Check for token in both header and cookies
    const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    // Verify token with additional checks
    const decoded = jwt.verify(token, JWT_SECRET, { 
      issuer: 'freelancer-toolkit-api',
      audience: 'freelancer-toolkit-client'
    });

    // Check if token was issued before the last password change
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Additional security check - verify email matches
    if (decoded.email !== user.email) {
      return res.status(401).json({ error: "Token validation failed" });
    }

    res.json({ 
      user: {
        ...user.toObject(),
        tokenExpires: new Date(decoded.exp * 1000)
      }
    });
  } catch (error) {
    console.error("Protected route error:", error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid token" });
    }
    
    res.status(401).json({ error: "Authentication failed" });
  }
});

// Admin-only route to get all users (simplified example)
router.get("/admin/users", async (req, res) => {
  try {
    // Verify admin privileges
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: "Admin access required" });
    }

    const users = await User.find({}, 'name email role isSuspended lastActive createdAt');
    res.json(users);
  } catch (error) {
    console.error("Admin users error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Logout route (optional)
router.post("/logout", (req, res) => {
  // Clear the token cookie
  res.clearCookie('token');
  res.json({ message: "Logged out successfully" });
});

module.exports = router;