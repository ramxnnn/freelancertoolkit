const mongoose = require('mongoose');
const User = require('./models/User');
const Task = require('./models/Task');
const Workspace = require('./models/Workspace');
const CurrencyConversion = require('./models/CurrencyConversion');

mongoose.connect('mongodb+srv://n01273481:Whited00r!@freelancecluster.cxczc.mongodb.net/freelancer_toolkit', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB Atlas');

  // Insert a test user
  const user = new User({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'user',
  });
  await user.save();

  // Insert a test task
  const task = new Task({
    userId: user._id,
    title: 'Complete Capstone Project',
    description: 'Implement Task Manager and Dashboard',
    dueDate: new Date('2023-12-31'),
    status: 'Pending',
    priority: 'High',
    category: 'Work',
  });
  await task.save();

  // Insert a test workspace
  const workspace = new Workspace({
    userId: user._id,
    placeId: 'ChIJn6oO4_KxEmsRkOZ5eX7YAAQ',
    name: 'Cozy Cafe',
    address: '123 Main St, Toronto, ON',
    latitude: 43.6532,
    longitude: -79.3832,
    rating: 4.5,
  });
  await workspace.save();

  // Insert a test currency conversion
  const currencyConversion = new CurrencyConversion({
    userId: user._id,
    fromCurrency: 'USD',
    toCurrency: 'CAD',
    amount: 100,
    convertedAmount: 130,
    rate: 1.3,
  });
  await currencyConversion.save();

  console.log('Test data inserted successfully');
  mongoose.connection.close();
})
.catch((err) => console.error('Error connecting to MongoDB Atlas:', err));