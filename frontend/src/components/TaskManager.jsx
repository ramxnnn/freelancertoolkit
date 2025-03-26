import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Card from './Card';
import Button from './Button';
import Input from './Input';

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  // Define API base URL
  const API_BASE_URL = 'https://freelancerbackend.vercel.app';

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in again.');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Backend should already filter by userId, but this is a safety check
      const userTasks = response.data.filter(task => task.userId === user._id);
      setTasks(userTasks);
    } catch (error) {
      if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('token');
        // Optionally redirect to login
      } else {
        setError('Failed to fetch tasks. Please try again.');
      }
      console.error('Fetch tasks error:', error);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found. Please log in again.');
        return;
      }

      if (!title.trim() || !dueDate) {
        setError('Title and Due Date are required');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/tasks`,
        {
          userId: user._id,
          title,
          description,
          dueDate,
          status: 'Pending' // Added default status
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks([...tasks, response.data]);
      setTitle('');
      setDescription('');
      setDueDate('');
      setError('');
    } catch (error) {
      console.error('Add task error:', error);
      setError(error.response?.data?.message || 'Failed to add task. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Task Manager</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <Card className="p-6 mb-6">
        <form onSubmit={handleAddTask} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title*
            </label>
            <Input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
              Due Date*
            </label>
            <Input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]} // Prevent past dates
            />
          </div>
          <Button type="submit" className="w-full">
            Add Task
          </Button>
        </form>
      </Card>
      
      {tasks.length > 0 ? (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={task._id} className="border p-4 rounded-lg bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-xl font-semibold">{task.title}</h5>
                  {task.description && (
                    <p className="text-gray-700 mt-1">{task.description}</p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  task.status === 'Completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {task.status}
                </span>
              </div>
              <p className="text-gray-600 mt-2">
                <strong>Due:</strong> {new Date(task.dueDate).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">No tasks found. Add your first task above.</p>
      )}
    </div>
  );
};

export default TaskManager;