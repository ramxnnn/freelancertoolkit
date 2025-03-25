import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Button from './Button';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [usersRes, tasksRes] = await Promise.all([
          axios.get('http://localhost:8888/admin/users', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('https://freelancerbackend.vercel.app/admin/tasks', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setUsers(usersRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        setError('Failed to fetch admin data');
      }
    };

    if (user?.role === 'admin') fetchData();
  }, [user]);

  const deleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://freelancerbackend.vercel.app/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 p-3 mb-4 rounded">{error}</div>}

      <section className="mb-8">
        <h3 className="text-2xl font-semibold mb-4">Users</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {users.map(user => (
            <div key={user._id} className="p-4 border-b flex justify-between items-center">
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-gray-600">{user.email}</p>
                <span className={`text-sm ${user.role === 'admin' ? 'text-blue-600' : 'text-gray-500'}`}>
                  {user.role}
                </span>
              </div>
              <Button 
                onClick={() => deleteUser(user._id)}
                className="bg-red-600 hover:bg-red-700 px-3 py-1.5 text-sm"
              >
                Delete User
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-semibold mb-4">All Tasks</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {tasks.map(task => (
            <div key={task._id} className="p-4 border-b">
              <p className="font-medium">{task.title}</p>
              <p className="text-gray-600">{task.description}</p>
              <p className="text-sm text-gray-500">
                Owner: {task.userId?.name || 'Unknown'} ({task.userId?.email})
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;