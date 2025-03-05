import React, { useState } from 'react';
import Card from './Card'; // Reusable Card component
import Button from './Button'; // Reusable Button component
import Input from './Input'; // Reusable Input component

const InvoiceForm = ({ userId, onInvoiceCreated }) => {
  const [clientName, setClientName] = useState('');
  const [services, setServices] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Pending');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const invoiceData = { userId, clientName, services, amount, dueDate, status };
    const response = await fetch('/invoices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });

    if (response.ok) {
      const newInvoice = await response.json();
      onInvoiceCreated(newInvoice); // Notify parent component
    } else {
      const errorData = await response.json();
      console.error(errorData.error);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Create Invoice</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
          <Input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Services</label>
          <Input
            type="text"
            value={services}
            onChange={(e) => setServices(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Pending">Pending</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
        <Button type="submit" className="w-full">Create Invoice</Button>
      </form>
    </Card>
  );
};

export default InvoiceForm;