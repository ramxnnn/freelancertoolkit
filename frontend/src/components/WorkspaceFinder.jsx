import React, { useState, useEffect } from 'react';
import { getWorkspaces } from '../api/api';
import Button from './Button';
import Input from './Input';

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
      // API directly returns the array of workspaces
      const workspacesData = await getWorkspaces(location);
      console.log('API Response:', workspacesData);
      
      setWorkspaces(workspacesData || []);
      // If you need next_page_token, ensure your API returns it separately
      // setNextPageToken(workspacesData.next_page_token || null);
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
      const moreWorkspaces = await getWorkspaces(location, nextPageToken);
      setWorkspaces(prev => [...prev, ...(moreWorkspaces || [])]);
      // setNextPageToken(moreWorkspaces.next_page_token || null);
    } catch (error) {
      setError('Failed to fetch more workspaces.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="workspaces" className="container mx-auto p-4">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Workspace Finder</h2>
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {!isLoading && !error && workspaces.length === 0 && (
            <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
              No workspaces found
            </div>
          )}

          <ul className="space-y-4">
            {workspaces.map((workspace) => (
              <li 
                key={workspace.place_id} 
                className="border p-4 rounded-lg bg-white shadow-md"
              >
                <h3 className="text-xl font-bold mb-2">
                  {workspace.name || 'Unnamed Workspace'}
                </h3>
                <p className="text-gray-600 mb-2">
                  {workspace.formatted_address || 'Address unavailable'}
                </p>
                
                {workspace.rating && (
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1">{workspace.rating}</span>
                  </div>
                )}

                {workspace.photos?.[0]?.photo_reference && (
                  <img
                    src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${workspace.photos[0].photo_reference}&key=YOUR_API_KEY`}
                    alt={workspace.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
              </li>
            ))}
          </ul>

          {nextPageToken && (
            <Button
              variant="secondary"
              onClick={handleLoadMore}
              disabled={isLoading}
              className="w-full mt-4"
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default WorkspaceFinder;