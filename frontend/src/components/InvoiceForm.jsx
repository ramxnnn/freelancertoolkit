// InvoiceForm.jsx
import React, { useState } from 'react';

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
      onInvoiceCreated(newInvoice);  // Notify parent component
    } else {
      const errorData = await response.json();
      console.error(errorData.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Client Name:
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          required
        />
      </label>
      <label>
        Services:
        <input
          type="text"
          value={services}
          onChange={(e) => setServices(e.target.value)}
          required
        />
      </label>
      <label>
        Amount:
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </label>
      <label>
        Due Date:
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
        />
      </label>
      <label>
        Status:
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
        </select>
      </label>
      <button type="submit">Create Invoice</button>
    </form>
  );
};

export default InvoiceForm;
