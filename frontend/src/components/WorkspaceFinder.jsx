import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      const workspacesData = await getWorkspaces(location);
      setWorkspaces(workspacesData || []);
    } catch (error) {
      setError('Failed to fetch workspaces. Please try again later.');
      console.error('Search error:', error);
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
    } catch (error) {
      setError('Failed to load more workspaces.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="workspaces" className="container mx-auto p-4 max-w-4xl">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-center text-indigo-600 mb-8"
      >
        Find Your Perfect Workspace
      </motion.h2>
      
      <div className="flex justify-center">
        <div className="w-full">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter city, address, or neighborhood"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch} 
              disabled={isLoading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition duration-200 transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Find Workspaces
                </span>
              )}
            </Button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded shadow-sm overflow-hidden"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isLoading && !error && workspaces.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 p-6 bg-indigo-50 border border-indigo-100 rounded-xl text-center"
            >
              <svg className="w-16 h-16 mx-auto text-indigo-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-medium text-indigo-700 mb-2">No workspaces found</h3>
              <p className="text-indigo-600">Try searching for a different location</p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {workspaces.map((workspace) => (
                <motion.div
                  key={workspace.place_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2 text-gray-800">
                      {workspace.name || 'Unnamed Workspace'}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {workspace.formatted_address || 'Address unavailable'}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      {workspace.rating && (
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="ml-1 font-medium">{workspace.rating}</span>
                          <span className="text-gray-400 text-sm ml-1">({workspace.user_ratings_total || 0})</span>
                        </div>
                      )}
                      {workspace.opening_hours && (
                        <span className={`text-sm px-2 py-1 rounded-full ${workspace.opening_hours.open_now ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {workspace.opening_hours.open_now ? 'Open Now' : 'Closed'}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {nextPageToken && (
            <div className="mt-8 text-center">
              <Button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-6 py-3 bg-white hover:bg-gray-50 text-indigo-600 border border-indigo-200 rounded-lg shadow-sm transition duration-150"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </span>
                ) : (
                  <span>Load More Workspaces</span>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WorkspaceFinder;