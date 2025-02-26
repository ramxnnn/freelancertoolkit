const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  clientName: String,
  services: String,
  amount: Number,
  date: { type: Date, default: Date.now },
  dueDate: Date,
  status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
