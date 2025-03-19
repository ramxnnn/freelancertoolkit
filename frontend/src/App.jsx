import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Header from './components/Header';
import CurrencyConverter from './components/CurrencyConverter';
import WorkspaceFinder from './components/WorkspaceFinder';
import TimezoneDisplay from './components/TimezoneDisplay';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import Projects from './components/Projects'; // Corrected import (ensure the file name matches)
import Invoices from './components/Invoices'; // Add this import
import './styles/styles.css';

// Reusable Components
import Button from './components/Button';
import Card from './components/Card';

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
  const { user, isLoading } = React.useContext(AuthContext);

  // Show loading state until the auth check is done
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>; // Tailwind loading state
  }

  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <TaskManager />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <PrivateRoute>
                <Projects />
              </PrivateRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <PrivateRoute>
                <Invoices />
              </PrivateRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* Other Public Routes */}
          <Route path="/currency" element={<CurrencyConverter />} />
          <Route path="/workspacefinder" element={<WorkspaceFinder />} /> {/* Updated path */}
          <Route path="/timezone" element={<TimezoneDisplay />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;