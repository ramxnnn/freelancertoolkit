import React, { useState, useEffect } from 'react';
import Card from './Card';
import Button from './Button';
import Input from './Input';

const InvoiceForm = ({ userId, onInvoiceCreated }) => {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [clientName, setClientName] = useState('');
  const [services, setServices] = useState([{ name: '', quantity: '', price: '' }]);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Pending');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8888/api/projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, []);

  const addService = () => {
    setServices([...services, { name: '', quantity: '', price: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in again.');
        return;
      }

      // Validate services
      const hasEmptyFields = services.some(s => 
        !s.name.trim() || 
        s.quantity === '' || 
        s.price === '' ||
        isNaN(s.quantity) || 
        isNaN(s.price)
      );

      if (hasEmptyFields) {
        setError('Please fill all service fields with valid values');
        return;
      }

      // Convert to numbers and calculate total
      const calculatedAmount = services.reduce((sum, service) => {
        return sum + (Number(service.quantity) * Number(service.price));
      }, 0);

      const invoiceData = { 
        userId,
        projectId: projectId || null,
        clientName,
        services: services.map(s => ({
          name: s.name,
          quantity: Number(s.quantity),
          price: Number(s.price)
        })),
        amount: calculatedAmount,
        dueDate,
        status
      };

      const response = await fetch('http://localhost:8888/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(invoiceData),
      });

      if (response.ok) {
        const newInvoice = await response.json();
        onInvoiceCreated(newInvoice);
        setProjectId('');
        setClientName('');
        setServices([{ name: '', quantity: '', price: '' }]);
        setDueDate('');
        setStatus('Pending');
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create invoice.');
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Create Invoice</h2>
      {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a Project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
          <Input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Enter client name"
            required
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Services</label>
          {services.map((service, index) => (
            <div key={index} className="flex gap-4 items-end">
              <Input
                placeholder="Service name (e.g., Web Development)"
                value={service.name}
                onChange={(e) => {
                  const newServices = [...services];
                  newServices[index].name = e.target.value;
                  setServices(newServices);
                }}
                required
              />
              <Input
                type="number"
                placeholder="Quantity (e.g., 2)"
                value={service.quantity}
                onChange={(e) => {
                  const newServices = [...services];
                  newServices[index].quantity = e.target.value;
                  setServices(newServices);
                }}
                min="1"
                required
              />
              <Input
                type="number"
                placeholder="Price per unit (e.g., 100)"
                value={service.price}
                onChange={(e) => {
                  const newServices = [...services];
                  newServices[index].price = e.target.value;
                  setServices(newServices);
                }}
                min="0"
                step="0.01"
                required
              />
            </div>
          ))}
          <Button type="button" onClick={addService} variant="secondary">
            Add Service
          </Button>
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