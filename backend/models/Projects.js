const mongoose = require('mongoose'); // Add this line

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'In Progress', 'Completed'],
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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversionRate: {
    type: Number,
    required: true
  }
});

// Add this line for better query performance
projectSchema.index({ userId: 1 });

module.exports = mongoose.model('Project', projectSchema);