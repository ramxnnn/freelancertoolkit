import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import TaskManager from './TaskManager';
import WorkspaceFinder from './WorkspaceFinder';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="dashboard container mt-5">
      <h2 className="text-center mb-4">Welcome, {user?.name}!</h2>
      <div className="row">
        <div className="col-md-6">
          <div className="dashboard-section">
            <h3 className="text-center mb-4">Task Manager</h3>
            <TaskManager />
          </div>
        </div>
        <div className="col-md-6">
          <div className="dashboard-section">
            <h3 className="text-center mb-4">Workspace Finder</h3>
            <WorkspaceFinder />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;