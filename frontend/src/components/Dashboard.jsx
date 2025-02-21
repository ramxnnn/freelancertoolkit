import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaTasks, FaMoneyBillWave, FaClock, FaMapMarkerAlt, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Welcome Back, {user?.name}! 👋</h2>
      
      {/* Quick Actions */}
      <div className="d-flex justify-content-center gap-3 mb-4">
        <button className="btn btn-primary d-flex align-items-center gap-2">
          <FaPlus /> Add Task
        </button>
        <button className="btn btn-secondary d-flex align-items-center gap-2">
          <FaMapMarkerAlt /> Find Workspace
        </button>
      </div>
      
      <div className="row row-cols-1 row-cols-md-2 g-4">
        {/* Recent Tasks */}
        <div className="col">
          <div className="card h-100 p-3 shadow rounded">
            <h3 className="text-center d-flex align-items-center gap-2">
              <FaTasks /> Recent Tasks
            </h3>
            <ul className="list-unstyled">
              <li className="border p-3 rounded mb-2 bg-light">
                <h5>Complete Capstone Project</h5>
                <p>Status: <span className="text-warning">In Progress</span></p>
                <p>Due Date: 2023-12-31</p>
              </li>
              <li className="border p-3 rounded bg-light">
                <h5>Prepare Presentation</h5>
                <p>Status: <span className="text-danger">Pending</span></p>
                <p>Due Date: 2023-11-15</p>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Currency Conversions */}
        <div className="col">
          <div className="card h-100 p-3 shadow rounded">
            <h3 className="text-center d-flex align-items-center gap-2">
              <FaMoneyBillWave /> Currency Conversions
            </h3>
            <ul className="list-unstyled">
              <li className="border p-3 rounded mb-2 bg-light">
                <p><strong>100 USD → 130 CAD</strong></p>
                <p>Rate: 1.3</p>
              </li>
              <li className="border p-3 rounded bg-light">
                <p><strong>50 EUR → 55 USD</strong></p>
                <p>Rate: 1.1</p>
              </li>
            </ul>
            {/* Add link to Currency Converter */}
            <div className="text-center mt-3">
              <Link to="/currency" className="btn btn-primary">Go to Currency Converter</Link>
            </div>
          </div>
        </div>
        
        {/* Timezones */}
        <div className="col">
          <div className="card h-100 p-3 shadow rounded">
            <h3 className="text-center d-flex align-items-center gap-2">
              <FaClock /> Timezones
            </h3>
            <ul className="list-unstyled">
              <li className="border p-3 rounded mb-2 bg-light">
                <p>New York: <strong>10:00 AM</strong></p>
                <p>UTC Offset: -5 hours</p>
              </li>
              <li className="border p-3 rounded bg-light">
                <p>London: <strong>3:00 PM</strong></p>
                <p>UTC Offset: +0 hours</p>
              </li>
            </ul>
            {/* Add link to Timezone Display */}
            <div className="text-center mt-3">
              <Link to="/timezone" className="btn btn-primary">Go to Timezone Display</Link>
            </div>
          </div>
        </div>
        
        {/* Nearby Workspaces */}
        <div className="col">
          <div className="card h-100 p-3 shadow rounded">
            <h3 className="text-center d-flex align-items-center gap-2">
              <FaMapMarkerAlt /> Nearby Workspaces
            </h3>
            <ul className="list-unstyled">
              <li className="border p-3 rounded mb-2 bg-light">
                <h5>Cozy Cafe</h5>
                <p>📍 123 Main St, Toronto</p>
                <p>⭐ Rating: 4.5</p>
              </li>
              <li className="border p-3 rounded bg-light">
                <h5>Quiet Library</h5>
                <p>📍 456 Elm St, Toronto</p>
                <p>⭐ Rating: 4.2</p>
              </li>
            </ul>
            {/* Add link to Workspace Finder */}
            <div className="text-center mt-3">
              <Link to="/workspaces" className="btn btn-primary">Go to Workspace Finder</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
