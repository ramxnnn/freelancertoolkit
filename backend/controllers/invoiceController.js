const Invoice = require("../models/Invoice");

exports.getInvoices = async (req, res) => {
  try {
    const { projectId, status } = req.query;
    const filter = { userId: req.user.userId }; // Changed from _id to userId
    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;

    const invoices = await Invoice.find(filter);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const { clientName, services, amount, dueDate, status, projectId } = req.body;

    if (!clientName || !services || !amount || !dueDate || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ error: "At least one service is required" });
    }

    const invoiceData = {
      userId: req.user.userId, // Changed from _id to userId
      clientName,
      services,
      amount,
      dueDate,
      status,
      projectId: projectId || null
    };

    const newInvoice = new Invoice(invoiceData);
    await newInvoice.save();
    res.status(201).json(newInvoice);
  } catch (error) {
    console.error("Invoice creation error:", error);
    res.status(400).json({ 
      error: error.message.startsWith("Invoice validation failed") 
        ? "Invalid invoice data" 
        : "Failed to create invoice" 
    });
  }
};