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
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in again.');
        return;
      }

      const response = await axios.get('https://freelancerbackend.vercel.app/invoices', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setInvoices(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setError('Session expired. Please log in again.');
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
            font-family: Arial, Helvetica, sans-serif;
            margin: 0;
            padding: 20px;
            color: #000000 !important;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 20px;
            color: #000000 !important;
          }
          h1 {
            color: #2c3e50 !important;
            text-align: center;
            margin-bottom: 30px;
          }
          .invoice-details {
            margin: 20px 0;
            padding: 15px;
            background-color: #f8f9fa !important;
            border-radius: 5px;
          }
          .invoice-details p {
            margin: 8px 0;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #dee2e6 !important;
            padding: 12px;
            text-align: left;
            color: #000000 !important;
          }
          th {
            background-color: #e9ecef !important;
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6c757d !important;
          }
          .total-section {
            margin-top: 20px;
            padding: 15px;
            background-color: #f8f9fa !important;
            border-radius: 5px;
          }
          .total-section p {
            margin: 8px 0;
            font-size: 16px;
            font-weight: bold;
          }
        </style>

        <div class="company-name">Freelancer Toolkit</div>
        <h1>Invoice</h1>
        
        <div class="invoice-details">
          <p><strong>Invoice Number:</strong> ${invoice._id}</p>
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
            ${invoice.services.map((service) => `
              <tr>
                <td>${service.name}</td>
                <td>${service.quantity}</td>
                <td>$${service.price.toFixed(2)}</td>
                <td>$${(service.quantity * service.price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <p>Subtotal: $${invoice.amount.toFixed(2)}</p>
          <p>Tax (10%): $${(invoice.amount * 0.1).toFixed(2)}</p>
          <p>Total: $${(invoice.amount * 1.1).toFixed(2)}</p>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Contact us at support@freelancertoolkit.com</p>
        </div>
      `;

      const options = {
        margin: [10, 10],
        filename: `Invoice_${invoice.clientName}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      };

      setTimeout(() => {
        html2pdf()
          .set(options)
          .from(element)
          .save();
      }, 100);
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
      <InvoiceForm onInvoiceCreated={handleInvoiceCreated} />
      <ul className="space-y-4 mt-6">
        {invoices.map((invoice) => (
          <li key={invoice._id} className="border p-4 rounded-lg bg-gray-50">
            <h5 className="text-xl font-bold">{invoice.clientName}</h5>
            <div className="space-y-2">
              {invoice.services.map((service, index) => (
                <div key={index} className="text-gray-700">
                  {service.name} (Qty: {service.quantity}, Price: ${service.price})
                </div>
              ))}
            </div>
            <p className="text-gray-700">Total: ${invoice.amount}</p>
            <p className="text-gray-700">Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
            <p className="text-gray-700">Status: {invoice.status}</p>
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