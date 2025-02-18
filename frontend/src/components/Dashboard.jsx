import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import TaskManager from './TaskManager';
import WorkspaceFinder from './WorkspaceFinder';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="container mt-5">
      <h2>Welcome, {user?.name}!</h2>
      <div className="row">
        <div className="col-md-6">
          <TaskManager />
        </div>
        <div className="col-md-6">
          <WorkspaceFinder />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;