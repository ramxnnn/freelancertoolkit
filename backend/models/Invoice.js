const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  price: Number
});

const invoiceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  clientName: String,
  services: [serviceSchema],
  amount: Number,
  date: { type: Date, default: Date.now },
  dueDate: Date,
  paymentDate: Date,
  status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;