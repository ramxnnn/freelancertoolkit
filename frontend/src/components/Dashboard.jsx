import React, { useState, useEffect } from "react";
import {
  FaTasks,
  FaMoneyBillWave,
  FaMoon,
  FaSun,
  FaMapMarkerAlt,
  FaClock,
  FaCalendarAlt,
  FaDollarSign,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getProjectEarnings } from "../api/api";

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [projects, setProjects] = useState([]);
  const [earningsData, setEarningsData] = useState([]);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888';

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Fetch projects and earnings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch projects
        const projectsResponse = await fetch(`${API_BASE_URL}/api/projects`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!projectsResponse.ok) throw new Error("Failed to fetch projects");
        const projectsData = await projectsResponse.json();
        setProjects(projectsData);

        // Fetch earnings for completed projects
        const completedProjects = projectsData.filter(p => p.status === "Completed");
        const earnings = await Promise.all(
          completedProjects.map(async (project) => {
            const earnings = await getProjectEarnings(project._id);
            return { ...earnings, name: project.name };
          })
        );
        
        setEarningsData(earnings);
      } catch (error) {
        console.error("Dashboard error:", error);
      }
    };

    fetchData();
  }, []);

  // Chart data
  const pieData = [
    { name: "Completed Tasks", value: 65 },
    { name: "Pending Tasks", value: 35 },
  ];
  const COLORS = ["#4CAF50", "#F44336"];

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} min-h-screen p-6`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button onClick={toggleDarkMode} className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600">
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div whileHover={{ scale: 1.05 }} className={`p-6 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-md`}>
          <FaTasks className="text-3xl mb-2 text-blue-500" />
          <h2 className="text-lg font-semibold">Total Projects</h2>
          <p className="text-xl font-bold">{projects.length}</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} className={`p-6 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-md`}>
          <FaMoneyBillWave className="text-3xl mb-2 text-green-500" />
          <h2 className="text-lg font-semibold">Total Earnings</h2>
          <p className="text-xl font-bold">
            ${earningsData.reduce((sum, earnings) => sum + (earnings.totalEarnings || 0), 0)}
          </p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className={`p-6 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-md`}>
          <h2 className="text-lg font-semibold mb-4">Earnings Overview</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={earningsData}>
              <XAxis dataKey="name" stroke={darkMode ? "#fff" : "#000"} />
              <YAxis stroke={darkMode ? "#fff" : "#000"} />
              <Tooltip />
              <Bar dataKey="totalEarnings" fill="#3b82f6" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={`p-6 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-md`}>
          <h2 className="text-lg font-semibold mb-4">Task Completion</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={80} label>
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Completed Projects */}
      <div className="mt-6">
        <div className={`p-6 ${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-md`}>
          <h2 className="text-lg font-semibold mb-4">Completed Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects
              .filter(project => project.status === "Completed")
              .map(project => (
                <motion.div
                  key={project._id}
                  whileHover={{ scale: 1.02 }}
                  className={`p-6 border rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-50"}`}
                >
                  <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-500" />
                      <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-gray-500" />
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaClock className="text-gray-500" />
                      <span>{project.timezone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaDollarSign className="text-gray-500" />
                      <span>{project.currency}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-sm">
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