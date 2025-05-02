import React, { useState, FormEvent, useEffect } from 'react';
import './FlightPage.css';
import { FaSearch, FaPlus, FaSort, FaEdit, FaChevronRight, FaCalendarAlt, FaPlane } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getAllFlights } from '../../../services/flight/flightService';
import { Flight as ApiFlight } from '../../../types/flight';

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

  const [flights, setFlights] = useState<ApiFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const totalPages = Math.ceil(flights.length / pageSize);
  const pagedFlights = flights.slice((page - 1) * pageSize, page * pageSize);

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

  useEffect(() => {
    const fetchFlights = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllFlights();
        setFlights(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to fetch flights');
      } finally {
        setLoading(false);
      }
    };
    fetchFlights();
  }, []);

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
            </div>
            <div className="search-row" style={{ justifyContent: 'flex-end' }}>
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
          {loading ? (
            <div className="flight-table-empty">Loading...</div>
          ) : error ? (
            <div className="flight-table-empty">{error}</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Flight ID</th>
                  <th>Flight_number</th>
                  <th className="aircraft">Aircraft</th>
                  <th className="route">Route</th>
                  <th>Date</th>
                  <th>Depart</th>
                  <th>Arrival</th>
                  <th className="remark">Remark</th>
                </tr>
              </thead>
              <tbody>
                {pagedFlights.map((flight) => (
                  <tr key={flight.flight_id}>
                    <td>
                      <span className={`status-badge ${flight.flight_status?.toLowerCase()}`}>{flight.flight_status}</span>
                    </td>
                    <td>{flight.flight_id}</td>
                    <td>{flight.flight_number}</td>
                    <td className="aircraft">{flight.aircraft?.model ?? '-'}</td>
                    <td className="route">
                      {flight.route?.from_airport?.iata_code && flight.route?.to_airport?.iata_code
                        ? `${flight.route.from_airport.iata_code} → ${flight.route.to_airport.iata_code}`
                        : '-'}
                    </td>
                    <td>{flight.departure_time ? new Date(flight.departure_time).toLocaleDateString('th-TH') : '-'}</td>
                    <td>{flight.departure_time ? new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td>{flight.arrival_time ? new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td
                      className="remark"
                      data-hastext={!!flight.cancellation_reason && flight.cancellation_reason !== '-' ? 'true' : undefined}
                      title={flight.cancellation_reason && flight.cancellation_reason !== '-' ? flight.cancellation_reason : undefined}
                    >
                      {flight.cancellation_reason
                        ? (flight.cancellation_reason.length > 32
                            ? flight.cancellation_reason.slice(0, 32) + '...'
                            : flight.cancellation_reason)
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="table-pagination">
            <div className="page-size">
              Show
              <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              entries
            </div>
            <div className="page-controls">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
              <span className="page-info">Page {page} / {totalPages || 1}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightPage; 