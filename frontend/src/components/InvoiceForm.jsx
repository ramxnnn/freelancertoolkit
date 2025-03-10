import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import Input from './Input';

const InvoiceForm = ({ userId, onInvoiceCreated }) => {
  const [clientName, setClientName] = useState('');
  const [services, setServices] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Pending');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token'); // Get the token from localStorage
      if (!token) {
        setError('No token found. Please log in again.');
        return;
      }

      const invoiceData = { userId, clientName, services, amount, dueDate, status };
      const response = await fetch('http://localhost:8888/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // Include the token in the request headers
        },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        const newInvoice = await response.json();
        onInvoiceCreated(newInvoice);
        setClientName('');
        setServices('');
        setAmount('');
        setDueDate('');
        setStatus('Pending');
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create invoice.');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem('token'); // Clear the invalid token
        setError('Session expired. Please log in again.');
        // Redirect to login page
        window.location.href = '/login';
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Create Invoice</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
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