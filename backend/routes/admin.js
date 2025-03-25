const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require("../models/User");
const Task = require("../models/Task");

// Enhanced Admin Middleware
const isAdmin = async (req, res, next) => {
  try {
    // 1. Verify Authorization Header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: "Authorization token required" });
    }

    // 2. Verify JWT Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Fetch User from Database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // 4. Check Admin Role
    if (user.role !== 'admin') {
      return res.status(403).json({ error: "Admin privileges required" });
    }

    // 5. Attach User to Request
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid token" });
    }
    
    res.status(500).json({ error: "Authentication failed" });
  }
};

// Get all users (admin only)
router.get("/users", isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: "Failed to fetch users",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete user (admin only)
router.delete("/users/:id", isAdmin, async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ 
      message: "User deleted successfully",
      deletedUserId: req.params.id
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      error: "Failed to delete user",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all tasks (admin only)
router.get("/tasks", isAdmin, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 }); // Newest first
      
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ 
      error: "Failed to fetch tasks",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;