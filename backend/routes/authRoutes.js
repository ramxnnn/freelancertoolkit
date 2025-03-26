const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Secret key for JWT (use environment variable for security)
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Register Route - Allows users to sign up, with role-based access control
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Prevent unauthorized users from creating admin accounts
    const requestingUser = req.user; // Retrieved from auth middleware
    if (role === 'admin' && (!requestingUser || requestingUser.role !== 'admin')) {
      return res.status(403).json({ error: "Only admins can create admin accounts" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Ensure password meets security requirements
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    // Check if the email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    // Securely hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create and store the new user
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role,
      lastActive: new Date()
    });

    await user.save();

    // Generate a JWT token that includes user details
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role,
        email: user.email 
      }, 
      JWT_SECRET, 
      { expiresIn: "1d" } 
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
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Something went wrong while registering" });
  }
});

// Login Route - Handles user authentication
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Ensure both fields are provided
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Prevent login if account is suspended
    if (user.isSuspended) {
      return res.status(403).json({ 
        error: "This account has been suspended. Contact support." 
      });
    }

    // Verify password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();

    // Generate JWT token with additional security attributes
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

    // Set token as a secure cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 
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
    console.error("Error during login:", error);
    res.status(500).json({ error: "Something went wrong while logging in" });
  }
});

// Protected Route - Requires authentication
router.get("/protected", async (req, res) => {
  try {
    // Token can be provided in headers or cookies
    const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." });
    }

    // Verify the token and its claims
    const decoded = jwt.verify(token, JWT_SECRET, { 
      issuer: 'freelancer-toolkit-api',
      audience: 'freelancer-toolkit-client'
    });

    // Fetch the user and ensure the token is still valid
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({ 
      user: {
        ...user.toObject(),
        tokenExpires: new Date(decoded.exp * 1000)
      }
    });
  } catch (error) {
    console.error("Protected route error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

// Admin Route - Lists all users
router.get("/admin/users", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: "Only admins can access this route" });
    }

    const users = await User.find({}, 'name email role isSuspended lastActive createdAt');
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Could not retrieve users" });
  }
});

// Logout Route - Clears authentication token
router.post("/logout", (req, res) => {
  res.clearCookie('token');
  res.json({ message: "Successfully logged out" });
});

module.exports = router;
