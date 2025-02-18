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
import './styles/styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
  const { user } = React.useContext(AuthContext);
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

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* Other Public Routes */}
          <Route path="/currency" element={<CurrencyConverter />} />
          <Route path="/workspaces" element={<WorkspaceFinder />} />
          <Route path="/timezone" element={<TimezoneDisplay />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;