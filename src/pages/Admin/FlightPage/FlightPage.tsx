import React, { useState, FormEvent } from 'react';
import './FlightPage.css';
import { FaSearch, FaPlus, FaSort, FaEdit, FaChevronRight, FaCalendarAlt, FaPlane } from 'react-icons/fa';
import { Link } from 'react-router-dom';

interface Flight {
  status: 'Schedule' | 'Cancelled';
  flightId: number;
  flightNumber: string;
  aircraftId: number;
  routeId: number;
  date: string;
  depart: string;
  arrival: string;
  remark: string | null;
}

interface SearchFormData {
  from: string;
  to: string;
  date: string;
  flightNumber: string;
  status: string;
}

const FlightPage: React.FC = () => {
  const [searchData, setSearchData] = useState<SearchFormData>({
    from: '',
    to: '',
    date: '',
    flightNumber: '',
    status: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: Implement search logic
    console.log('Search data:', searchData);
  };

  // Mock data - will be replaced with API data later
  const flights: Flight[] = [
    {
      status: 'Schedule',
      flightId: 1,
      flightNumber: 'TG101',
      aircraftId: 2,
      routeId: 5,
      date: '2025-04-30',
      depart: '09:00',
      arrival: '11:00',
      remark: null
    },
    {
      status: 'Schedule',
      flightId: 1,
      flightNumber: 'TG101',
      aircraftId: 2,
      routeId: 5,
      date: '2025-04-30',
      depart: '09:00',
      arrival: '11:00',
      remark: null
    },
    {
      status: 'Cancelled',
      flightId: 1,
      flightNumber: 'TG101',
      aircraftId: 2,
      routeId: 5,
      date: '2025-04-30',
      depart: '09:00',
      arrival: '11:00',
      remark: 'Heavy storm in Tokyo'
    }
  ];

  return (
    <div className="flight-page">
      <div className="breadcrumb">
        <Link to="/admin">Dashboard</Link>
        <FaChevronRight className="breadcrumb-separator" />
        <span>Flight</span>
      </div>

      <div className="content-wrapper">
        <div className="page-header">
          <h2>Flight</h2>
        </div>

        <form className="search-section" onSubmit={handleSubmit}>
          <h3>Search Flights</h3>
          
          <div className="search-grid">
            <div className="search-row">
              <div className="form-group">
                <label>Route Information</label>
                <div className="route-inputs">
                  <div className="input-with-icon">
                    <FaPlane className="input-icon" />
                    <input
                      name="from"
                      type="text"
                      placeholder="Departure city..."
                      value={searchData.from}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="input-with-icon">
                    <FaPlane className="input-icon" />
                    <input
                      name="to"
                      type="text"
                      placeholder="Arrival city..."
                      value={searchData.to}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="search-row">
              <div className="form-group">
                <label>Flight Details</label>
                <div className="flight-details-inputs">
                  <div className="input-with-icon">
                    <FaCalendarAlt className="input-icon" />
                    <input
                      name="date"
                      type="date"
                      value={searchData.date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <input
                    name="flightNumber"
                    type="text"
                    placeholder="TG..."
                    value={searchData.flightNumber}
                    onChange={handleInputChange}
                  />
                  <select
                    name="status"
                    value={searchData.status}
                    onChange={handleInputChange}
                  >
                    <option value="">All Status</option>
                    <option value="schedule">Schedule</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="delayed">Delayed</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="search-button">
                <FaSearch /> Search Flights
              </button>
            </div>
          </div>
        </form>

        <div className="table-actions">
          <button className="add-new-button">
            <FaPlus /> Add new
          </button>
          <button className="sort-button">
            <FaSort /> Sort by
          </button>
          <button className="edit-button">
            <FaEdit /> Edit
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Flight ID</th>
                <th>Flight_number</th>
                <th>Aircraft ID</th>
                <th>Route ID</th>
                <th>Date</th>
                <th>Depart</th>
                <th>Arrival</th>
                <th>Remark</th>
              </tr>
            </thead>
            <tbody>
              {flights.map((flight, index) => (
                <tr key={index}>
                  <td>
                    <span className={`status-badge ${flight.status.toLowerCase()}`}>
                      {flight.status}
                    </span>
                  </td>
                  <td>{flight.flightId}</td>
                  <td>{flight.flightNumber}</td>
                  <td>{flight.aircraftId}</td>
                  <td>{flight.routeId}</td>
                  <td>{flight.date}</td>
                  <td>{flight.depart}</td>
                  <td>{flight.arrival}</td>
                  <td>{flight.remark || 'null'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FlightPage; 