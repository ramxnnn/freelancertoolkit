import React, { useState } from 'react';
import axios from 'axios';
import Card from './Card'; // Reusable Card component
import Button from './Button'; // Reusable Button component
import Input from './Input'; // Reusable Input component

const TimezoneDisplay = () => {
  const [city, setCity] = useState('');
  const [timezone, setTimezone] = useState(null);
  const [error, setError] = useState('');

  const handleGetTimezone = async () => {
    setError('');
    try {
      // Make a request to backend with the city name
      const response = await axios.get(`https://freelancerbackend.vercel.app/api/timezones?location=${encodeURIComponent(city)}`);
      
      // If the response contains timezone data
      if (response.data.timeZoneId && response.data.timeZoneName) {
        setTimezone(response.data);
      } else {
        throw new Error('No timezone data found for the city.');
      }
    } catch (error) {
      setError('Failed to fetch timezone data. Please try again.');
    }
  };

  return (
    <section id="timezone" className="container mx-auto p-4">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">Timezone Information</h2>
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <div className="flex gap-2 mb-4">
            <Input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name"
            />
            <Button onClick={handleGetTimezone}>Get Timezone</Button>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          {timezone && (
            <Card className="p-6">
              <h5 className="text-xl font-bold mb-4">Timezone Details</h5>
              <p className="text-gray-700"><strong>Timezone:</strong> {timezone.timeZoneName}</p>
              <p className="text-gray-700"><strong>Timezone ID:</strong> {timezone.timeZoneId}</p>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};

export default TimezoneDisplay;