const Project = require("../models/Projects");
const Invoice = require("../models/Invoice");

// Get all projects for the logged-in user
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { name, status, dueDate, location, currency } = req.body;
    const newProject = new Project({ userId: req.user._id, name, status, dueDate, location, currency });
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: "Failed to create project" });
  }
};

// Calculate earnings for a project
exports.calculateEarnings = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Fetch all paid invoices for the project
    const paidInvoices = await Invoice.find({ projectId, status: 'Paid' });

    // Calculate total earnings
    const totalEarnings = paidInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);

    res.json({ projectId, totalEarnings, paidInvoicesCount: paidInvoices.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate earnings" });
  }
};