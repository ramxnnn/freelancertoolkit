const Invoice = require("../models/Invoice");

// Get all invoices (with optional filters)
exports.getInvoices = async (req, res) => {
  try {
    const { projectId, status } = req.query;
    const filter = { userId: req.user._id }; // Filter by logged-in user
    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;

    const invoices = await Invoice.find(filter);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
};

// Create a new invoice
exports.createInvoice = async (req, res) => {
  try {
    const { clientName, services, amount, dueDate, status, projectId } = req.body;
    const newInvoice = new Invoice({ userId: req.user._id, clientName, services, amount, dueDate, status, projectId });
    await newInvoice.save();
    res.status(201).json(newInvoice);
  } catch (error) {
    res.status(500).json({ error: "Failed to create invoice" });
  }
};