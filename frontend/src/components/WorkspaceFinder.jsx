import React, { useState } from 'react';
import { getWorkspaces } from '../api/api';


const WorkspaceFinder = () => {
  const [location, setLocation] = useState('');
  const [workspaces, setWorkspaces] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setError('');
    try {
      const results = await getWorkspaces(location);
      setWorkspaces(results);
    } catch (error) {
      setError('Failed to fetch workspaces.');
    }
  };

  return (
    <section id="workspaces" className="container mt-5">
      <h2 className="text-center mb-4">Workspace Finder</h2>
      <div className="row justify-content-center">
        <div className="col-md-6 col-12">
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
            />
            <button className="btn btn-primary" onClick={handleSearch}>
              Search
            </button>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <ul className="list-group">
            {workspaces.map((workspace) => (
              <li key={workspace.place_id} className="list-group-item">
                <h5>{workspace.name}</h5>
                <p>{workspace.vicinity}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default WorkspaceFinder;
