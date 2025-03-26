import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Button from './Button';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (location.pathname === '/login') return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="w-full bg-gray-800 text-white p-4 shadow-lg z-40 sticky top-0">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Freelancer Toolkit</h1>
        
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-sm"
              >
                Dashboard
              </Button>

              {user?.role === 'admin' && (
                <Button
                  onClick={() => navigate('/admin')}
                  className="bg-purple-600 hover:bg-purple-700 px-3 py-1.5 text-sm"
                >
                  Admin
                </Button>
              )}

              <Button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-1.5 text-sm"
              >
                Logout
              </Button>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-1.5 hover:bg-gray-700 rounded-md transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-xl border border-gray-700 z-50">
                    <div className="p-1 space-y-1">
                      <NavItem path="/tasks" label="Tasks" toggle={() => setIsMenuOpen(false)} />
                      <NavItem path="/projects" label="Projects" toggle={() => setIsMenuOpen(false)} />
                      <NavItem path="/invoices" label="Invoices" toggle={() => setIsMenuOpen(false)} />
                      {user?.role === 'admin' && (
                        <NavItem path="/admin" label="Admin Panel" toggle={() => setIsMenuOpen(false)} />
                      )}
                      <NavItem path="/currency" label="Currency Converter" toggle={() => setIsMenuOpen(false)} />
                      <NavItem
                        path="/workspacefinder"
                        label="Workspace Locator"
                        toggle={() => setIsMenuOpen(false)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Button
                onClick={() => navigate('/login')}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-sm"
              >
                Login
              </Button>
              <Button
                onClick={() => navigate('/register')}
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-sm"
              >
                Register
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

const NavItem = ({ path, label, toggle }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => {
        navigate(path);
        toggle();
      }}
      className="w-full px-3 py-1.5 text-left text-xs text-gray-300 hover:bg-gray-700 rounded-[4px] transition-colors whitespace-nowrap"
    >
      {label}
    </button>
  );
};

export default Header;