const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Task = require("../models/Task");

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: "Admin access required" });
  }
};

// Get all users (admin only)
router.get("/users", isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Delete user (admin only)
router.delete("/users/:id", isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get all tasks (admin only)
router.get("/tasks", isAdmin, async (req, res) => {
  try {
    const tasks = await Task.find().populate('userId', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;