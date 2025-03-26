import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaTasks, FaFileInvoice, FaProjectDiagram, FaCog } from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: <FaHome className="text-base" />, label: 'Dashboard' },
    { path: '/tasks', icon: <FaTasks className="text-base" />, label: 'Tasks' },
    { path: '/projects', icon: <FaProjectDiagram className="text-base" />, label: 'Projects' },
    { path: '/invoices', icon: <FaFileInvoice className="text-base" />, label: 'Invoices' },
    { path: '/settings', icon: <FaCog className="text-base" />, label: 'Settings' },
  ];

  return (
    <div className="fixed h-full w-56 bg-gray-800 text-white flex flex-col">
      {/* Logo/Sidebar Header - Reduced font size */}
      <div className="p-3 border-b border-gray-700">
        <h1 className="text-lg font-semibold">Freelancer Toolkit</h1>
      </div>
      
      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-1 px-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center p-2 rounded-md transition-colors text-sm ${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* User Profile - Reduced font size */}
      <div className="p-3 border-t border-gray-700">
        <div className="flex items-center">
          <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center mr-2 text-xs">
            <span>U</span>
          </div>
          <span className="truncate text-sm">User Account</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;