import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-dark text-white p-3">
      <div className="container d-flex justify-content-between align-items-center">
        <h1>Freelancer Toolkit</h1>
        <nav>
          {user ? (
            <>
              <Link to="/dashboard" className="text-white me-3">Dashboard</Link>
              <Link to="/tasks" className="text-white me-3">Tasks</Link>
              <button onClick={handleLogout} className="btn btn-danger">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white me-3">Login</Link>
              <Link to="/register" className="text-white me-3">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;