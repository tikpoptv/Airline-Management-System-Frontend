import React, { useState, FormEvent, useEffect, useRef } from 'react';
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
  const [filteredFlights, setFilteredFlights] = useState<ApiFlight[] | null>(null);

  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);
  const [flightNumberSuggestions, setFlightNumberSuggestions] = useState<string[]>([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showFlightNumberDropdown, setShowFlightNumberDropdown] = useState(false);
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);
  const flightNumberInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!searchData.from && !searchData.to && !searchData.flightNumber && !searchData.date && !searchData.status) {
      setFilteredFlights([]);
      setPage(1);
      return;
    }
    let result = flights;
    if (searchData.from) {
      result = result.filter(f => f.route?.from_airport?.iata_code?.toLowerCase().includes(searchData.from.toLowerCase()));
    }
    if (searchData.to) {
      result = result.filter(f => f.route?.to_airport?.iata_code?.toLowerCase().includes(searchData.to.toLowerCase()));
    }
    if (searchData.flightNumber) {
      result = result.filter(f => f.flight_number?.toLowerCase().includes(searchData.flightNumber.toLowerCase()));
    }
    if (searchData.date) {
      result = result.filter(f => {
        if (!f.departure_time) return false;
        const flightDate = new Date(f.departure_time);
        const y = flightDate.getFullYear();
        const m = (flightDate.getMonth() + 1).toString().padStart(2, '0');
        const d = flightDate.getDate().toString().padStart(2, '0');
        const flightDateStr = `${y}-${m}-${d}`;
        return flightDateStr === searchData.date;
      });
    }
    if (searchData.status) {
      result = result.filter(f => f.flight_status?.toLowerCase() === searchData.status.toLowerCase());
    }
    setFilteredFlights(result);
    setPage(1);
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

  // Helper: unique, case-insensitive
  const unique = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

  // Suggestion logic
  useEffect(() => {
    if (flights.length) {
      setFromSuggestions(unique(flights.map(f => f.route?.from_airport?.iata_code || '').filter(Boolean)));
      setToSuggestions(unique(flights.map(f => f.route?.to_airport?.iata_code || '').filter(Boolean)));
      setFlightNumberSuggestions(unique(flights.map(f => f.flight_number || '').filter(Boolean)));
    }
  }, [flights]);

  // Filtered suggestions
  const filteredFrom = fromSuggestions.filter(s => s.toLowerCase().includes(searchData.from.toLowerCase()) && searchData.from);
  const filteredTo = toSuggestions.filter(s => s.toLowerCase().includes(searchData.to.toLowerCase()) && searchData.to);
  const filteredFlightNumber = flightNumberSuggestions.filter(s => s.toLowerCase().includes(searchData.flightNumber.toLowerCase()) && searchData.flightNumber);

  // Handle select suggestion
  const handleSelectSuggestion = (field: keyof SearchFormData, value: string) => {
    setSearchData(prev => ({ ...prev, [field]: value }));
    if (field === 'from') setShowFromDropdown(false);
    if (field === 'to') setShowToDropdown(false);
    if (field === 'flightNumber') setShowFlightNumberDropdown(false);
  };

  // ให้ pagedFlights ใช้ filteredFlights ถ้าเคยค้นหา (filteredFlights !== null)
  const flightsToShow = filteredFlights !== null
    ? filteredFlights
    : flights;
  const totalPages = Math.ceil(flightsToShow.length / pageSize);
  const pagedFlights = flightsToShow.slice((page - 1) * pageSize, page * pageSize);

  // เพิ่มฟังก์ชัน reset
  const handleReset = () => {
    setSearchData({
      from: '',
      to: '',
      date: '',
      flightNumber: '',
      status: ''
    });
    setFilteredFlights(null);
    setPage(1);
  };

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

        <form className="search-section" onSubmit={handleSubmit} autoComplete="off">
          <h3>Search Flights</h3>
          
          <div className="search-grid">
            <div className="search-row">
              <div className="form-group">
                <label>Route Information</label>
                <div className="route-inputs">
                  <div className="input-with-icon" style={{ position: 'relative' }}>
                    <FaPlane className="input-icon" />
                    <input
                      name="from"
                      type="text"
                      placeholder="Departure city..."
                      value={searchData.from}
                      onChange={handleInputChange}
                      onFocus={() => setShowFromDropdown(true)}
                      onBlur={() => setTimeout(() => setShowFromDropdown(false), 120)}
                      ref={fromInputRef}
                      autoComplete="off"
                    />
                    {showFromDropdown && filteredFrom.length > 0 && (
                      <ul className="autocomplete-dropdown">
                        {filteredFrom.map(s => (
                          <li key={s} onMouseDown={() => handleSelectSuggestion('from', s)}>{s}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="input-with-icon" style={{ position: 'relative' }}>
                    <FaPlane className="input-icon" />
                    <input
                      name="to"
                      type="text"
                      placeholder="Arrival city..."
                      value={searchData.to}
                      onChange={handleInputChange}
                      onFocus={() => setShowToDropdown(true)}
                      onBlur={() => setTimeout(() => setShowToDropdown(false), 120)}
                      ref={toInputRef}
                      autoComplete="off"
                    />
                    {showToDropdown && filteredTo.length > 0 && (
                      <ul className="autocomplete-dropdown">
                        {filteredTo.map(s => (
                          <li key={s} onMouseDown={() => handleSelectSuggestion('to', s)}>{s}</li>
                        ))}
                      </ul>
                    )}
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
                      onFocus={e => e.target.showPicker && e.target.showPicker()}
                    />
                  </div>
                  <div className="input-with-icon" style={{ position: 'relative' }}>
                    <input
                      name="flightNumber"
                      type="text"
                      placeholder="TG..."
                      value={searchData.flightNumber}
                      onChange={handleInputChange}
                      onFocus={() => setShowFlightNumberDropdown(true)}
                      onBlur={() => setTimeout(() => setShowFlightNumberDropdown(false), 120)}
                      ref={flightNumberInputRef}
                      autoComplete="off"
                    />
                    {showFlightNumberDropdown && filteredFlightNumber.length > 0 && (
                      <ul className="autocomplete-dropdown">
                        {filteredFlightNumber.map(s => (
                          <li key={s} onMouseDown={() => handleSelectSuggestion('flightNumber', s)}>{s}</li>
                        ))}
                      </ul>
                    )}
                  </div>
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
              {filteredFlights !== null && (
                <button type="button" className="search-button" style={{ marginLeft: 8, background: '#f3f6fa', color: '#2563eb', border: '1.5px solid #e5eaf2' }} onClick={handleReset}>
                  Clear
                </button>
              )}
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
          ) : filteredFlights !== null && pagedFlights.length === 0 ? (
            <div className="flight-table-empty">No matching records found.</div>
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