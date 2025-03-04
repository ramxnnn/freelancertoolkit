import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaTasks, FaMoneyBillWave, FaClock, FaMapMarkerAlt, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const [completedProjects, setCompletedProjects] = useState([]);
  const [moneyMade, setMoneyMade] = useState(0);
  const [moneyOwed, setMoneyOwed] = useState(0);

  useEffect(() => {
    // Simulating fetching completed projects data
    const fetchCompletedProjects = async () => {
      // Mock data simulating your projects with currency and timezone
      const projects = [
        {
          id: 1,
          name: "Capstone Project",
          status: "Completed",
          dueDate: "2023-12-31",
          location: "Toronto, Canada",
          currency: "CAD",
          timezone: "EST",
        },
        {
          id: 2,
          name: "Freelance Website",
          status: "Completed",
          dueDate: "2023-11-15",
          location: "New York, USA",
          currency: "USD",
          timezone: "EST",
        },
      ];

      setCompletedProjects(projects);
    };

    // Simulating fetching invoices (money made and money owed)
    const fetchInvoices = async () => {
      // Mock data for invoices
      const invoices = [
        { amount: 500, status: "Paid" },
        { amount: 300, status: "Pending" },
      ];

      let moneyMadeTotal = 0;
      let moneyOwedTotal = 0;
      invoices.forEach((invoice) => {
        if (invoice.status === "Paid") {
          moneyMadeTotal += invoice.amount;
        } else if (invoice.status === "Pending") {
          moneyOwedTotal += invoice.amount;
        }
      });
      setMoneyMade(moneyMadeTotal);
      setMoneyOwed(moneyOwedTotal);
    };

    fetchCompletedProjects();
    fetchInvoices();
  }, [user.id]);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Welcome Back, {user?.name}! 👋</h2>

      {/* Dashboard Overview */}
      <div className="text-center mb-4">
        <p><strong>Money Made: </strong>${moneyMade}</p>
        <p><strong>Money Owed: </strong>${moneyOwed}</p>
      </div>

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
        {/* Completed Projects Section */}
        <div className="col">
          <div className="card h-100 p-3 shadow rounded">
            <h3 className="text-center d-flex align-items-center gap-2">
              <FaTasks /> Completed Projects
            </h3>
            <ul className="list-unstyled">
              {completedProjects.map((project) => (
                <li key={project.id} className="border p-3 rounded mb-2 bg-light">
                  <h5>{project.name}</h5>
                  <p>Status: <span className={project.status === "Completed" ? "text-success" : "text-warning"}>{project.status}</span></p>
                  <p>Due Date: {project.dueDate}</p>

                  {/* Display Timezone and Currency Conversion */}
                  <div className="d-flex justify-content-between">
                    <div>
                      <p><strong>Timezone: </strong>{project.timezone}</p>
                      <p><strong>Currency: </strong>{project.currency}</p>
                    </div>
                    <div className="text-center">
                      <Link to={`/project-details/${project.id}`} className="btn btn-primary">View Details</Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;