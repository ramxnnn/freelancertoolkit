const Sidebar = () => {
    return (
      <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
        <h2 className="text-2xl font-bold mb-6">Freelancer Toolkit</h2>
        <nav>
          <ul>
            <li className="mb-3">
              <a href="#" className="hover:text-blue-400">Dashboard</a>
            </li>
            <li className="mb-3">
              <a href="#" className="hover:text-blue-400">Tasks</a>
            </li>
            <li className="mb-3">
              <a href="#" className="hover:text-blue-400">Invoices</a>
            </li>
          </ul>
        </nav>
      </div>
    );
  };
  
  export default Sidebar;