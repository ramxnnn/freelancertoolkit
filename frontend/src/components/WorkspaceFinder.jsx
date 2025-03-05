import React, { useState } from 'react';
import { getWorkspaces } from '../api/api';
import Card from './Card'; // Reusable Card component
import Button from './Button'; // Reusable Button component
import Input from './Input'; // Reusable Input component

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
          {workspaces.length === 0 && !isLoading && !error && (
            <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
              No workspaces found for this location.
            </div>
          )}
          <ul className="space-y-4">
            {workspaces.map((workspace) => (
              <li key={workspace.place_id} className="border p-4 rounded-lg bg-gray-50">
                <h5 className="text-xl font-bold">{workspace.name}</h5>
                <p className="text-gray-700">{workspace.vicinity}</p>
                {workspace.rating && (
                  <p className="text-gray-700"><strong>Rating:</strong> {workspace.rating}</p>
                )}
                {workspace.photos && workspace.photos.length > 0 && (
                  <img
                    src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${workspace.photos[0].photo_reference}&key=YOUR_GOOGLE_PLACES_API_KEY`}
                    alt={workspace.name}
                    className="w-full h-auto rounded-lg mt-2"
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