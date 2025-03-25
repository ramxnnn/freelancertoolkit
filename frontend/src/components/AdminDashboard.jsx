import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FiUser, FiUserX, FiUserCheck, FiTrash2, FiActivity } from 'react-icons/fi';

// Set your backend API base URL (update this to match your actual backend URL)
const API_BASE_URL = 'https://freelancerbackend.vercel.app'; // Or your production URL

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState({
    users: false,
    tasks: false,
    stats: false
  });
  const { user } = useContext(AuthContext);

  const fetchData = async () => {
    try {
      console.log('[AdminDashboard] Starting data fetch...');
      setLoading({ users: true, tasks: true, stats: true });
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const [usersRes, tasksRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/admin/users`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(res => {
          console.log('[AdminDashboard] Users response:', res.data);
          return res;
        }).catch(err => {
          console.error('[AdminDashboard] Users fetch error:', err);
          throw new Error('Failed to fetch users');
        }),
        axios.get(`${API_BASE_URL}/admin/tasks`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(res => {
          console.log('[AdminDashboard] Tasks response:', res.data);
          return res;
        }).catch(err => {
          console.error('[AdminDashboard] Tasks fetch error:', err);
          throw new Error('Failed to fetch tasks');
        }),
        axios.get(`${API_BASE_URL}/admin/stats`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(res => {
          console.log('[AdminDashboard] Stats response:', res.data);
          return res;
        }).catch(err => {
          console.error('[AdminDashboard] Stats fetch error:', err);
          throw new Error('Failed to fetch stats');
        })
      ]);

      // Verify responses are JSON
      const verifyResponse = (res, endpoint) => {
        const contentType = res.headers['content-type'];
        if (!contentType?.includes('application/json')) {
          throw new Error(`Invalid response from ${endpoint} (got ${contentType})`);
        }
      };

      verifyResponse(usersRes, '/admin/users');
      verifyResponse(tasksRes, '/admin/tasks');
      verifyResponse(statsRes, '/admin/stats');

      // Handle different response formats
      const safeUsers = Array.isArray(usersRes?.data) 
        ? usersRes.data 
        : Array.isArray(usersRes?.data?.users) 
          ? usersRes.data.users 
          : [];
      
      const safeTasks = Array.isArray(tasksRes?.data) 
        ? tasksRes.data 
        : Array.isArray(tasksRes?.data?.tasks) 
          ? tasksRes.data.tasks 
          : [];

      console.log('[AdminDashboard] Processed users:', safeUsers);
      console.log('[AdminDashboard] Processed tasks:', safeTasks);
      
      setUsers(safeUsers);
      setTasks(safeTasks);
      setStats(statsRes?.data || null);

    } catch (err) {
      console.error('[AdminDashboard] Fetch error:', err);
      setError(err.message || 'Failed to fetch admin data');
      setUsers([]);
      setTasks([]);
      setStats(null);
    } finally {
      setLoading({ users: false, tasks: false, stats: false });
    }
  };

  useEffect(() => {
    console.log('[AdminDashboard] User context changed:', user);
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
      } catch (err) {
        console.error('[AdminDashboard] Delete user error:', err);
        setError('Failed to delete user: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const deleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/admin/tasks/${taskId}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setTasks(prevTasks => prevTasks.filter(t => t._id !== taskId));
      } catch (err) {
        console.error('[AdminDashboard] Delete task error:', err);
        setError('Failed to delete task: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/admin/users/${userId}/role`,
        { role: newRole },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      setUsers(prevUsers => prevUsers.map(u => 
        u._id === userId ? { ...u, role: newRole } : u
      ));
    } catch (err) {
      console.error('[AdminDashboard] Update role error:', err);
      setError('Failed to update user role: ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleSuspension = async (userId, isSuspended) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/admin/users/${userId}/suspend`,
        { suspend: !isSuspended },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      setUsers(prevUsers => prevUsers.map(u => 
        u._id === userId ? { ...u, isSuspended: !isSuspended } : u
      ));
    } catch (err) {
      console.error('[AdminDashboard] Toggle suspension error:', err);
      setError('Failed to update user status: ' + (err.response?.data?.message || err.message));
    }
  };

  const renderUserItem = (user) => (
    <div key={user._id} className="p-4 border-b flex justify-between items-center">
      <div className="flex-1">
        <div className="flex items-center">
          <p className="font-medium mr-3">{user.name}</p>
          <span className={`text-xs px-2 py-1 rounded ${
            user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
          }`}>
            {user.role}
          </span>
          {user.isSuspended && (
            <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 ml-2">
              Suspended
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm">{user.email}</p>
      </div>
      
      <div className="flex space-x-2">
        <select
          value={user.role}
          onChange={(e) => updateUserRole(user._id, e.target.value)}
          className={`text-sm px-2 py-1 rounded border ${
            user.role === 'admin' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        
        <button
          onClick={() => toggleSuspension(user._id, user.isSuspended)}
          className={`p-1 rounded ${
            user.isSuspended ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
          }`}
          title={user.isSuspended ? 'Unsuspend user' : 'Suspend user'}
        >
          {user.isSuspended ? <FiUserCheck /> : <FiUserX />}
        </button>
        
        <button
          onClick={() => deleteUser(user._id)}
          className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
          title="Delete user"
          disabled={user._id === user._id}
        >
          <FiTrash2 />
        </button>
      </div>
    </div>
  );

  const renderTaskItem = (task) => (
    <div key={task._id} className="p-4 border-b">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium">{task.title}</p>
          <p className="text-gray-600 text-sm">{task.description}</p>
          <div className="mt-1 flex items-center text-xs text-gray-500">
            <span className="mr-2">Status: {task.status}</span>
            <span>Priority: {task.priority}</span>
          </div>
          {task.userId && (
            <p className="text-xs mt-1">
              Owner: {task.userId.name || 'Unknown'} ({task.userId.email || 'No email'})
            </p>
          )}
        </div>
        <button
          onClick={() => deleteTask(task._id)}
          className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
          title="Delete task"
        >
          <FiTrash2 />
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 mb-4 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
          {error.includes('Invalid response') && (
            <div className="mt-2 text-sm">
              <p>This usually means:</p>
              <ul className="list-disc pl-5">
                <li>The backend server is not running at {API_BASE_URL}</li>
                <li>The API endpoints don't exist</li>
                <li>There's a CORS configuration issue</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Stats Section */}
      {stats && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <FiUser className="text-blue-500 text-2xl mr-3" />
              <div>
                <h3 className="text-gray-500 text-sm">Total Users</h3>
                <p className="text-2xl font-bold">{stats.totalUsers || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <FiActivity className="text-green-500 text-2xl mr-3" />
              <div>
                <h3 className="text-gray-500 text-sm">Total Tasks</h3>
                <p className="text-2xl font-bold">{stats.totalTasks || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <FiUserX className="text-red-500 text-2xl mr-3" />
              <div>
                <h3 className="text-gray-500 text-sm">Suspended Users</h3>
                <p className="text-2xl font-bold">{stats.suspendedUsers || 0}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Users Section */}
      <section className="mb-8">
        <h3 className="text-2xl font-semibold mb-4">User Management</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading.users ? (
            <div className="p-4 text-center">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-4 text-center">No users found</div>
          ) : (
            users.map(renderUserItem)
          )}
        </div>
      </section>

      {/* Tasks Section */}
      <section>
        <h3 className="text-2xl font-semibold mb-4">Task Management</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading.tasks ? (
            <div className="p-4 text-center">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="p-4 text-center">No tasks found</div>
          ) : (
            tasks.map(renderTaskItem)
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;