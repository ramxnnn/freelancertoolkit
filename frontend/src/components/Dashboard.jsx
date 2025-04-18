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
  FaFileInvoice,
  FaProjectDiagram,
  FaPlay,
  FaPause,
  FaStop,
  FaCheck,
  FaSpinner
} from "react-icons/fa";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getProjectEarnings } from "../api/api";

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [earningsData, setEarningsData] = useState([]);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888';

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Stopwatch logic
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const startStopwatch = () => setIsRunning(true);
  const pauseStopwatch = () => setIsRunning(false);
  const resetStopwatch = () => {
    setIsRunning(false);
    setTime(0);
  };

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time % 3600000) / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds
      .toString()
      .padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const [projectsResponse, tasksResponse, invoicesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/projects`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/tasks`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/invoices`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (!projectsResponse.ok || !tasksResponse.ok || !invoicesResponse.ok) {
          throw new Error("Failed to fetch data");
        }

        const [projectsData, tasksData, invoicesData] = await Promise.all([
          projectsResponse.json(),
          tasksResponse.json(),
          invoicesResponse.json()
        ]);

        setProjects(projectsData);
        setTasks(tasksData);
        setInvoices(invoicesData);

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

  const taskData = [
    { name: "Completed Tasks", value: tasks.filter(t => t.status === "Completed").length },
    { name: "Pending Tasks", value: tasks.filter(t => t.status === "Pending").length },
  ];
  
  const COLORS = ["#10B981", "#EF4444"];

  const ProjectCard = ({ project }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className={`p-5 rounded-lg border ${
        darkMode 
          ? "bg-slate-800/60 border-slate-700/50 hover:border-slate-600/50" 
          : "bg-white/60 border-slate-200/50 hover:border-slate-300/50"
      } transition-all shadow-sm hover:shadow-md`}
    >
      <h3 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400">
        {project.name}
      </h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <FaCalendarAlt className="text-slate-500 dark:text-slate-400 flex-shrink-0" />
          <span className="text-sm">
            Due: {new Date(project.dueDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <FaMapMarkerAlt className="text-slate-500 dark:text-slate-400 flex-shrink-0" />
          <span className="text-sm">{project.location}</span>
        </div>
        <div className="flex items-center gap-3">
          <FaClock className="text-slate-500 dark:text-slate-400 flex-shrink-0" />
          <span className="text-sm">Timezone: {project.timezone}</span>
        </div>
        <div className="flex items-center gap-3">
          <FaDollarSign className="text-slate-500 dark:text-slate-400 flex-shrink-0" />
          <span className="text-sm">Currency: {project.currency}</span>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          project.status === "Completed" 
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
            : project.status === "Pending"
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
              : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
        }`}>
          {project.status}
        </span>
      </div>
    </motion.div>
  );

  const TaskCard = ({ task }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className={`p-5 rounded-lg border ${
        darkMode 
          ? "bg-slate-800/60 border-slate-700/50 hover:border-slate-600/50" 
          : "bg-white/60 border-slate-200/50 hover:border-slate-300/50"
      } transition-all shadow-sm hover:shadow-md`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
          {task.name}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          task.status === "Completed" 
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
            : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
        }`}>
          {task.status}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <FaCalendarAlt className="text-slate-500 dark:text-slate-400 flex-shrink-0" />
          <span className="text-sm">
            Due: {new Date(task.dueDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {task.status === "Completed" ? (
            <FaCheck className="text-green-500 dark:text-green-400 flex-shrink-0" />
          ) : (
            <FaSpinner className="text-amber-500 dark:text-amber-400 flex-shrink-0" />
          )}
          <span className="text-sm">
            {task.status === "Completed" ? "Completed" : "In Progress"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <FaTasks className="text-slate-500 dark:text-slate-400 flex-shrink-0" />
          <span className="text-sm">
            {task.description || "No description"}
          </span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`transition-colors duration-300 ${darkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-900"} min-h-screen p-4 md:p-6`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <button 
          onClick={toggleDarkMode} 
          className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600/50 backdrop-blur-sm transition-all"
        >
          {darkMode ? <FaSun className="text-yellow-300" /> : <FaMoon className="text-blue-200" />}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div 
          whileHover={{ scale: 1.03 }}
          className={`p-6 backdrop-blur-sm rounded-xl shadow-lg ${
            darkMode 
              ? "bg-slate-800/80 border border-slate-700/50" 
              : "bg-white/80 border border-slate-200/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-3">
              <FaTasks className="text-2xl text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Projects</h2>
              <p className="text-2xl font-bold">{projects.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.03 }}
          className={`p-6 backdrop-blur-sm rounded-xl shadow-lg ${
            darkMode 
              ? "bg-slate-800/80 border border-slate-700/50" 
              : "bg-white/80 border border-slate-200/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-3">
              <FaMoneyBillWave className="text-2xl text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Earnings</h2>
              <p className="text-2xl font-bold">
                ${earningsData.reduce((sum, earnings) => sum + (earnings.totalEarnings || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.03 }}
          className={`p-6 backdrop-blur-sm rounded-xl shadow-lg ${
            darkMode 
              ? "bg-slate-800/80 border border-slate-700/50" 
              : "bg-white/80 border border-slate-200/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-3">
              <FaFileInvoice className="text-2xl text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Invoices</h2>
              <p className="text-2xl font-bold">{invoices.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.03 }}
          className={`p-6 backdrop-blur-sm rounded-xl shadow-lg ${
            darkMode 
              ? "bg-slate-800/80 border border-slate-700/50" 
              : "bg-white/80 border border-slate-200/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-3">
              <FaTasks className="text-2xl text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Tasks</h2>
              <p className="text-2xl font-bold">{taskData[1].value}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className={`p-6 rounded-xl shadow-lg ${
          darkMode 
            ? "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50" 
            : "bg-gradient-to-br from-white/80 to-slate-50/80 border border-slate-200/50"
        }`}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaMoneyBillWave className="text-blue-500" />
            <span>Earnings Overview</span>
          </h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={earningsData}>
                <XAxis 
                  dataKey="name" 
                  stroke={darkMode ? "#94a3b8" : "#64748b"} 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke={darkMode ? "#94a3b8" : "#64748b"} 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: darkMode ? "#1e293b" : "#ffffff",
                    borderColor: darkMode ? "#334155" : "#e2e8f0",
                    borderRadius: "8px",
                    boxShadow: darkMode ? "0 4px 6px rgba(0, 0, 0, 0.25)" : "0 4px 6px rgba(0, 0, 0, 0.1)",
                    fontSize: "14px"
                  }}
                />
                <Bar 
                  dataKey="totalEarnings" 
                  fill="#4f46e5" 
                  radius={[4, 4, 0, 0]} 
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-lg ${
          darkMode 
            ? "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50" 
            : "bg-gradient-to-br from-white/80 to-slate-50/80 border border-slate-200/50"
        }`}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaTasks className="text-green-500" />
            <span>Task Completion</span>
          </h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={taskData} 
                  dataKey="value" 
                  outerRadius={80}
                  innerRadius={60}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {taskData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index]} 
                      stroke={darkMode ? "#1e293b" : "#ffffff"}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: darkMode ? "#1e293b" : "#ffffff",
                    borderColor: darkMode ? "#334155" : "#e2e8f0",
                    borderRadius: "8px",
                    boxShadow: darkMode ? "0 4px 6px rgba(0, 0, 0, 0.25)" : "0 4px 6px rgba(0, 0, 0, 0.1)",
                    fontSize: "14px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stopwatch Section */}
      <div className={`p-6 rounded-xl shadow-lg mb-6 ${
        darkMode 
          ? "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50" 
          : "bg-gradient-to-br from-white/80 to-slate-50/80 border border-slate-200/50"
      }`}>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaClock className="text-amber-500" />
          <span>StopWatch</span>
        </h2>
        <div className="flex flex-col items-center justify-center py-4">
          <div className="text-4xl font-mono font-bold mb-6">
            {formatTime(time)}
          </div>
          <div className="flex gap-4">
            {!isRunning ? (
              <button 
                onClick={startStopwatch}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <FaPlay /> Start
              </button>
            ) : (
              <button 
                onClick={pauseStopwatch}
                className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
              >
                <FaPause /> Pause
              </button>
            )}
            <button 
              onClick={resetStopwatch}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <FaStop /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Pending Projects */}
      <div className={`p-6 rounded-xl shadow-lg mb-6 ${
        darkMode 
          ? "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50" 
          : "bg-gradient-to-br from-white/80 to-slate-50/80 border border-slate-200/50"
      }`}>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaProjectDiagram className="text-amber-500" />
          <span>Pending Projects</span>
        </h2>
        {projects.filter(project => project.status === "Pending").length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects
              .filter(project => project.status === "Pending")
              .map(project => (
                <ProjectCard key={project._id} project={project} />
              ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">
              No pending projects. Great job!
            </p>
          </div>
        )}
      </div>

      {/* Completed Projects */}
      <div className={`p-6 rounded-xl shadow-lg mb-6 ${
        darkMode 
          ? "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50" 
          : "bg-gradient-to-br from-white/80 to-slate-50/80 border border-slate-200/50"
      }`}>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaProjectDiagram className="text-green-500" />
          <span>Completed Projects</span>
        </h2>
        {projects.filter(project => project.status === "Completed").length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects
              .filter(project => project.status === "Completed")
              .map(project => (
                <ProjectCard key={project._id} project={project} />
              ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">
              No completed projects yet. Keep working!
            </p>
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div className={`p-6 rounded-xl shadow-lg mb-6 ${
        darkMode 
          ? "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50" 
          : "bg-gradient-to-br from-white/80 to-slate-50/80 border border-slate-200/50"
      }`}>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaTasks className="text-indigo-500" />
          <span>Tasks Overview</span>
        </h2>
        
        {/* Completed Tasks */}
        <div className="mb-8">
          <h3 className="text-md font-medium mb-3 flex items-center gap-2 text-green-600 dark:text-green-400">
            <FaCheck className="text-green-500 dark:text-green-400" />
            <span>Completed Tasks ({tasks.filter(t => t.status === "Completed").length})</span>
          </h3>
          {tasks.filter(t => t.status === "Completed").length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks
                .filter(task => task.status === "Completed")
                .slice(0, 3)
                .map(task => (
                  <TaskCard key={task._id} task={task} />
                ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-500 dark:text-slate-400">
                No completed tasks yet.
              </p>
            </div>
          )}
        </div>

        {/* Pending Tasks */}
        <div>
          <h3 className="text-md font-medium mb-3 flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <FaSpinner className="text-amber-500 dark:text-amber-400" />
            <span>Pending Tasks ({tasks.filter(t => t.status === "Pending").length})</span>
          </h3>
          {tasks.filter(t => t.status === "Pending").length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks
                .filter(task => task.status === "Pending")
                .slice(0, 3)
                .map(task => (
                  <TaskCard key={task._id} task={task} />
                ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-500 dark:text-slate-400">
                No pending tasks. Great job!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Invoices */}
      <div className={`p-6 rounded-xl shadow-lg ${
        darkMode 
          ? "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50" 
          : "bg-gradient-to-br from-white/80 to-slate-50/80 border border-slate-200/50"
      }`}>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaFileInvoice className="text-indigo-500" />
          <span>Recent Invoices</span>
        </h2>
        {invoices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invoices.slice(0, 6).map(invoice => (
              <motion.div
                key={invoice._id}
                whileHover={{ y: -5 }}
                className={`p-5 rounded-lg border ${
                  darkMode 
                    ? "bg-slate-800/60 border-slate-700/50 hover:border-slate-600/50" 
                    : "bg-white/60 border-slate-200/50 hover:border-slate-300/50"
                } transition-all shadow-sm hover:shadow-md`}
              >
                <h3 className="text-xl font-semibold mb-3 text-indigo-600 dark:text-indigo-400">
                  {invoice.clientName}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FaCalendarAlt className="text-slate-500 dark:text-slate-400 flex-shrink-0" />
                    <span className="text-sm">
                      Due: {new Date(invoice.dueDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaDollarSign className="text-slate-500 dark:text-slate-400 flex-shrink-0" />
                    <span className="text-sm">Amount: ${invoice.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      invoice.status === "Paid" 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">
              No invoices created yet. Create your first invoice!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;