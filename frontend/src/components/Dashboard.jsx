import React, { useState, useEffect } from "react";
import { FaTasks, FaMoneyBillWave, FaMoon, FaSun, FaMapMarkerAlt, FaClock, FaCalendarAlt, FaDollarSign } from "react-icons/fa";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [projects, setProjects] = useState([]); // State for storing fetched projects

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/projects"); // Replace with your API endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }
        const data = await response.json();
        setProjects(data); // Update state with fetched projects
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Mock data for earnings and tasks
  const earningsData = [
    { month: "Jan", earnings: 1200 },
    { month: "Feb", earnings: 1700 },
    { month: "Mar", earnings: 900 },
    { month: "Apr", earnings: 2200 },
  ];

  const pieData = [
    { name: "Completed Tasks", value: 65 },
    { name: "Pending Tasks", value: 35 },
  ];

  const COLORS = ["#4CAF50", "#F44336"];

  // Custom Tooltip for the Bar Chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg shadow-md ${darkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"}`}>
          <p className="font-semibold">{label}</p>
          <p>Earnings: ${payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} min-h-screen p-6`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button onClick={toggleDarkMode} className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600">
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`p-6 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-md`}
        >
          <FaTasks className="text-3xl mb-2 text-blue-500" />
          <h2 className="text-lg font-semibold">Total Tasks</h2>
          <p className="text-xl font-bold">34</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`p-6 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-md`}
        >
          <FaMoneyBillWave className="text-3xl mb-2 text-green-500" />
          <h2 className="text-lg font-semibold">Earnings</h2>
          <p className="text-xl font-bold">$5,200</p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Earnings Bar Chart */}
        <div className={`p-6 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-md`}>
          <h2 className="text-lg font-semibold mb-4">Earnings Overview</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={earningsData}>
              <XAxis dataKey="month" stroke={darkMode ? "#ffffff" : "#000000"} />
              <YAxis stroke={darkMode ? "#ffffff" : "#000000"} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="earnings" fill="#3b82f6" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task Pie Chart */}
        <div className={`p-6 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-md`}>
          <h2 className="text-lg font-semibold mb-4">Task Completion</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={80} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Completed Projects Section */}
      <div className="mt-6">
        <div className={`p-6 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-md`}>
          <h2 className="text-lg font-semibold mb-4">Completed Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                whileHover={{ scale: 1.02 }}
                className={`p-6 border rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"} transition-all duration-300`}
              >
                <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <FaCalendarAlt className={`${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                  <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>Due Date: {project.dueDate}</p>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <FaMapMarkerAlt className={`${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                  <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>{project.location}</p>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <FaClock className={`${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                  <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>{project.timezone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <FaDollarSign className={`${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                  <p className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>{project.currency}</p>
                </div>
                <div className="mt-4">
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-semibold ${
                      project.status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;