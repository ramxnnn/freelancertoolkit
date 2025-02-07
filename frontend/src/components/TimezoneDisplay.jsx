import React, { useState } from 'react';
import axios from 'axios';


const TimezoneDisplay = () => {
  const [city, setCity] = useState('');
  const [timezone, setTimezone] = useState(null);
  const [error, setError] = useState('');

  const handleGetTimezone = async () => {
    setError('');
    try {
      // Make a request to backend with the city name
      const response = await axios.get(`https://freelancer-toolkit.onrender.com/api/timezones?location=${encodeURIComponent(city)}`);
      
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
    <section id="timezone" className="container mt-5">
      <h2 className="text-center mb-4">Timezone Information</h2>
      <div className="row justify-content-center">
        <div className="col-md-6 col-12">
          {}
          <div className="d-flex mb-3">
            <input
              type="text"
              className="form-control me-2" 
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city name"
            />
            <button className="btn btn-primary" onClick={handleGetTimezone}>
              Get Timezone
            </button>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          {timezone && (
            <div className="card mt-4">
              <div className="card-body">
                <h5 className="card-title">Timezone Details</h5>
                <p className="card-text"><strong>Timezone:</strong> {timezone.timeZoneName}</p>
                <p className="card-text"><strong>Timezone ID:</strong> {timezone.timeZoneId}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TimezoneDisplay;
