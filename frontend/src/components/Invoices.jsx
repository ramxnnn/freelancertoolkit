import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Card from './Card';
import Button from './Button';
import InvoiceForm from './InvoiceForm';
import html2pdf from 'html2pdf.js';
import { motion, AnimatePresence } from 'framer-motion';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      fetchInvoices();
    }
  }, [user]);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in again.');
        setIsLoading(false);
        return;
      }

      const response = await axios.get('https://freelancerbackend.vercel.app/invoices', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setInvoices(response.data);
      setError('');
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setError('Session expired. Please log in again.');
        window.location.href = '/login';
      } else {
        setError('Failed to fetch invoices. Please try again.');
      }
    } finally {
      setIsLoading(false);
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
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 30px;
            color: #333;
          }
          .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 20px;
          }
          .company-info {
            text-align: left;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #4f46e5;
            margin-bottom: 5px;
          }
          .invoice-title {
            font-size: 28px;
            font-weight: bold;
            margin: 30px 0;
            color: #2d3748;
            text-align: center;
          }
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
          }
          .client-info, .invoice-meta {
            flex: 1;
          }
          .info-label {
            font-weight: 600;
            color: #4a5568;
            margin-bottom: 5px;
          }
          .info-value {
            margin-bottom: 15px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
          }
          th {
            background-color: #4f46e5;
            color: white;
            padding: 12px;
            text-align: left;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
          }
          tr:nth-child(even) {
            background-color: #f8fafc;
          }
          .total-section {
            margin-top: 20px;
            text-align: right;
          }
          .total-row {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 8px;
          }
          .total-label {
            width: 150px;
            font-weight: 600;
          }
          .total-value {
            width: 100px;
            text-align: right;
          }
          .grand-total {
            font-size: 18px;
            font-weight: bold;
            color: #4f46e5;
            border-top: 2px solid #4f46e5;
            padding-top: 10px;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #718096;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
          }
          .status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          }
          .status-paid {
            background-color: #dcfce7;
            color: #166534;
          }
          .status-pending {
            background-color: #fef08a;
            color: #854d0e;
          }
          .status-overdue {
            background-color: #fee2e2;
            color: #991b1b;
          }
        </style>

        <div class="header">
          <div class="company-info">
            <div class="company-name">Freelancer Toolkit</div>
            <div>123 Business Street</div>
            <div>City, Country 10001</div>
            <div>support@freelancertoolkit.com</div>
          </div>
          <div class="invoice-meta">
            <div class="info-label">INVOICE #</div>
            <div class="info-value">${invoice._id.slice(-8).toUpperCase()}</div>
            <div class="info-label">DATE ISSUED</div>
            <div class="info-value">${new Date().toLocaleDateString()}</div>
            <div class="info-label">DUE DATE</div>
            <div class="info-value">${new Date(invoice.dueDate).toLocaleDateString()}</div>
            <div class="info-label">STATUS</div>
            <div class="info-value">
              <span class="status status-${invoice.status.toLowerCase()}">${invoice.status}</span>
            </div>
          </div>
        </div>

        <div class="invoice-title">INVOICE</div>
        
        <div class="invoice-details">
          <div class="client-info">
            <div class="info-label">BILL TO</div>
            <div class="info-value">${invoice.clientName}</div>
            <div class="info-value">${invoice.clientEmail || 'N/A'}</div>
            <div class="info-value">${invoice.clientAddress || 'N/A'}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.services.map((service) => `
              <tr>
                <td>${service.name}</td>
                <td>${service.description || 'N/A'}</td>
                <td>${service.quantity}</td>
                <td>$${service.price.toFixed(2)}</td>
                <td>$${(service.quantity * service.price).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <div class="total-label">Subtotal:</div>
            <div class="total-value">$${invoice.amount.toFixed(2)}</div>
          </div>
          <div class="total-row">
            <div class="total-label">Tax (10%):</div>
            <div class="total-value">$${(invoice.amount * 0.1).toFixed(2)}</div>
          </div>
          <div class="total-row grand-total">
            <div class="total-label">TOTAL:</div>
            <div class="total-value">$${(invoice.amount * 1.1).toFixed(2)}</div>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Please make payments to: Bank Name | Account: 123456789 | Routing: 987654321</p>
          <p>Questions? Email support@freelancertoolkit.com or call (123) 456-7890</p>
        </div>
      `;

      const options = {
        margin: [10, 10],
        filename: `Invoice_${invoice.clientName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Animation variants
  const invoiceVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3
      }
    },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-center text-indigo-600 mb-8"
      >
        Invoice Management
      </motion.h2>
      
      {error && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="mb-6 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded shadow-sm"
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </motion.div>
      )}
      
      <Card className="p-6 mb-8 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl shadow-sm">
        <InvoiceForm onInvoiceCreated={handleInvoiceCreated} />
      </Card>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : invoices.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-700">Your Invoices ({invoices.length})</h3>
            <div className="text-sm text-gray-500">
              Showing all invoices
            </div>
          </div>
          
          <AnimatePresence>
            {invoices.map((invoice) => (
              <motion.div
                key={invoice._id}
                variants={invoiceVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                className="border border-gray-200 p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h5 className="text-lg font-semibold text-gray-800 truncate">
                            {invoice.clientName}
                          </h5>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Due: {new Date(invoice.dueDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                          {new Date(invoice.dueDate) < new Date() && invoice.status !== 'Paid' && (
                            <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Overdue</span>
                          )}
                        </p>
                        
                        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h6 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Services</h6>
                            <ul className="mt-1 space-y-1">
                              {invoice.services.slice(0, 2).map((service, index) => (
                                <li key={index} className="text-sm text-gray-700 truncate">
                                  {service.name} (x{service.quantity})
                                </li>
                              ))}
                              {invoice.services.length > 2 && (
                                <li className="text-sm text-gray-500">
                                  +{invoice.services.length - 2} more...
                                </li>
                              )}
                            </ul>
                          </div>
                          <div>
                            <h6 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</h6>
                            <p className="mt-1 text-sm font-medium text-gray-700">
                              {formatCurrency(invoice.amount * 1.1)}
                              <span className="text-xs text-gray-500 ml-1">(incl. tax)</span>
                            </p>
                          </div>
                          <div>
                            <h6 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</h6>
                            <p className="mt-1 text-sm font-mono text-gray-700">
                              {invoice._id.slice(-8).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button 
                      onClick={() => handleDownloadInvoice(invoice)}
                      className="text-sm py-1 px-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg border border-indigo-200 transition duration-150"
                    >
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-700 mb-1">No invoices yet</h3>
          <p className="text-gray-500">Create your first invoice using the form above</p>
        </motion.div>
      )}
    </div>
  );
};

export default Invoices;