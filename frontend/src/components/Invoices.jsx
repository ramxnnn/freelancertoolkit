import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Card from './Card';
import Button from './Button';
import InvoiceForm from './InvoiceForm';
import html2pdf from 'html2pdf.js';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user && user._id) {
      fetchInvoices();
    }
  }, [user]);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token'); // Get the token from localStorage
      if (!token) {
        setError('No token found. Please log in again.');
        return;
      }

      const response = await axios.get(`http://localhost:8888/invoices?userId=${user._id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the request headers
        },
      });
      setInvoices(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem('token'); // Clear the invalid token
        setError('Session expired. Please log in again.');
        // Redirect to login page
        window.location.href = '/login';
      } else {
        setError('Failed to fetch invoices. Please try again.');
      }
    }
  };

  const handleInvoiceCreated = (newInvoice) => {
    setInvoices([...invoices, newInvoice]);
  };

  const handleDownloadInvoice = (invoice) => {
    try {
      const element = document.createElement('div');
      element.innerHTML = `
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          h1 {
            color: #2c3e50;
            text-align: center;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 20px;
            color: #3b82f6;
          }
          .invoice-details {
            margin-top: 20px;
          }
          .invoice-details p {
            margin: 5px 0;
          }
          .invoice-details strong {
            display: inline-block;
            width: 120px;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        </style>
        <div class="company-name">Freelancer Toolkit</div>
        <h1>Invoice</h1>
        <div class="invoice-details">
          <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber || 'N/A'}</p>
          <p><strong>Client:</strong> ${invoice.clientName}</p>
          <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${invoice.status}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.services.map(
              (service) => `
              <tr>
                <td>${service.name}</td>
                <td>${service.quantity}</td>
                <td>$${service.price}</td>
                <td>$${service.quantity * service.price}</td>
              </tr>
            `
            ).join('')}
          </tbody>
        </table>
        <div class="invoice-details">
          <p><strong>Subtotal:</strong> $${invoice.subtotal || 0}</p>
          <p><strong>Tax (10%):</strong> $${(invoice.subtotal || 0) * 0.1}</p>
          <p><strong>Total:</strong> $${(invoice.subtotal || 0) * 1.1}</p>
        </div>
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Contact us at support@freelancertoolkit.com</p>
        </div>
      `;

      // Options for PDF generation
      const options = {
        margin: 10,
        filename: `Invoice_${invoice.clientName}.pdf`, // Custom file name
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      // Generate and save the PDF
      html2pdf().set(options).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Invoices</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <InvoiceForm userId={user?._id} onInvoiceCreated={handleInvoiceCreated} />
      <ul className="space-y-4 mt-6">
        {invoices.map((invoice) => (
          <li key={invoice._id} className="border p-4 rounded-lg bg-gray-50">
            <h5 className="text-xl font-bold">{invoice.clientName}</h5>
            <p className="text-gray-700">Services: {invoice.services}</p>
            <p className="text-gray-700">Amount: ${invoice.amount}</p>
            <p className="text-gray-700">Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
            <p className="text-gray-700">Status: ${invoice.status}</p>
            <Button onClick={() => handleDownloadInvoice(invoice)} className="mt-2">
              Download Invoice
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Invoices;