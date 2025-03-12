const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true }, // Link to Project
  clientName: String,
  services: String,
  amount: Number,
  date: { type: Date, default: Date.now },
  dueDate: Date,
  paymentDate: { type: Date }, // Track payment date
  status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;