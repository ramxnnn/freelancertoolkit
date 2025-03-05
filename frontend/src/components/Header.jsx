import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from './Button'; // Import the reusable Button component

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation(); // Get current route location

  // Avoid rendering Header on login page
  if (location.pathname === '/login') return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Freelancer Toolkit</h1>
        <nav className="flex items-center">
          {user ? (
            <>
              <Link to="/dashboard" className="text-white hover:text-blue-400 mr-4">Dashboard</Link>
              <Link to="/tasks" className="text-white hover:text-blue-400 mr-4">Tasks</Link>
              <Button variant="secondary" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:text-blue-400 mr-4">Login</Link>
              <Link to="/register" className="text-white hover:text-blue-400 mr-4">Register</Link>
            </>
          )}
          {/* Buttons for Timezone, Currency Converter, and Workspace Locator */}
          {user && (
            <>
              <Button 
                variant="secondary" 
                onClick={() => navigate('/timezone')}
                className="ml-4"
              >
                Timezone
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => navigate('/currency')}
                className="ml-4"
              >
                Currency Converter
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => navigate('/workspacefinder')}
                className="ml-4"
              >
                Workspace Locator
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
