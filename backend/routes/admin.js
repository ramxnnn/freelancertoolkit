const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Projects');
const Invoice = require('../models/Invoice');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get all users
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Delete user
router.delete('/users/:id', isAdmin, async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Update user role
router.patch('/users/:id/role', isAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    // Prevent self-demotion
    if (userId === req.user.userId && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot remove your own admin status' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Role update failed' });
  }
});

// Suspend/unsuspend user
router.patch('/users/:id/suspend', isAdmin, async (req, res) => {
  try {
    const { suspend } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended: suspend },
      { new: true, select: '-password' }
    );
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Suspension update failed' });
  }
});

// Get all tasks
router.get('/tasks', isAdmin, async (req, res) => {
  try {
    const tasks = await Task.find().populate('userId', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Delete any task
router.delete('/tasks/:id', isAdmin, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Task deletion failed' });
  }
});

// Admin statistics
router.get('/stats', isAdmin, async (req, res) => {
  try {
    const stats = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ isSuspended: true }),
      Task.countDocuments(),
      Project.countDocuments(),
      Invoice.countDocuments(),
      Task.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      totalUsers: stats[0],
      adminCount: stats[1],
      suspendedUsers: stats[2],
      totalTasks: stats[3],
      totalProjects: stats[4],
      totalInvoices: stats[5],
      taskStatus: stats[6]
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

module.exports = router;