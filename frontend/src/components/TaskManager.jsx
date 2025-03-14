import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Card from './Card'; // Reusable Card component
import Button from './Button'; // Reusable Button component
import Input from './Input'; // Reusable Input component

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`https://freelancer-toolkit.onrender.com/tasks/${user._id}`);
      setTasks(response.data);
    } catch (error) {
      setError('Failed to fetch tasks.');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://freelancer-toolkit.onrender.com/tasks', {
        userId: user._id,
        title,
        description,
        dueDate,
      });
      setTasks([...tasks, response.data]);
      setTitle('');
      setDescription('');
      setDueDate('');
    } catch (error) {
      setError('Failed to add task.');
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
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <Input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <Input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full">Add Task</Button>
        </form>
      </Card>
      <ul className="space-y-4">
        {tasks.map((task) => (
          <li key={task._id} className="border p-4 rounded-lg bg-gray-50">
            <h5 className="text-xl font-semibold">{task.title}</h5>
            <p className="text-gray-700">{task.description}</p>
            <p className="text-gray-600">
              <strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskManager;