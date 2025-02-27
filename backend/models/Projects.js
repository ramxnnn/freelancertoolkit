const mongoose = require('mongoose');

// Project schema definition
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'In Progress', 'Completed'], // Only allow specific status
  },
  dueDate: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  timezone: {
    type: String,
    required: true,
  },
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
