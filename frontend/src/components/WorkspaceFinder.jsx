import React, { useState } from 'react';
import { getWorkspaces } from '../api/api';

const WorkspaceFinder = () => {
  const [location, setLocation] = useState('');
  const [workspaces, setWorkspaces] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);

  const handleSearch = async () => {
    if (!location.trim()) {
      setError('Please enter a location.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const results = await getWorkspaces(location);
      setWorkspaces(results.results);
      setNextPageToken(results.next_page_token);
    } catch (error) {
      setError('Failed to fetch workspaces.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!nextPageToken) return;
    setIsLoading(true);
    try {
      const results = await getWorkspaces(location, nextPageToken);
      setWorkspaces((prev) => [...prev, ...results.results]);
      setNextPageToken(results.next_page_token);
    } catch (error) {
      setError('Failed to fetch more workspaces.');
    } finally {
      setIsLoading(false);
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
            <button className="btn btn-primary" onClick={handleSearch} disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          {workspaces.length === 0 && !isLoading && !error && (
            <div className="alert alert-info mt-3">No workspaces found for this location.</div>
          )}
          <ul className="list-group">
            {workspaces.map((workspace) => (
              <li key={workspace.place_id} className="list-group-item">
                <h5>{workspace.name}</h5>
                <p>{workspace.vicinity}</p>
                {workspace.rating && (
                  <p><strong>Rating:</strong> {workspace.rating}</p>
                )}
                {workspace.photos && workspace.photos.length > 0 && (
                  <img
                    src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${workspace.photos[0].photo_reference}&key=YOUR_GOOGLE_PLACES_API_KEY`}
                    alt={workspace.name}
                    className="img-fluid"
                  />
                )}
              </li>
            ))}
          </ul>
          {nextPageToken && (
            <button className="btn btn-secondary mt-3" onClick={handleLoadMore} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default WorkspaceFinder;