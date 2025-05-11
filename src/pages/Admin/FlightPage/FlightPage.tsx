import React, { useState, FormEvent, useEffect, useRef } from 'react';
import styles from './FlightPage.module.css';
import { FaSearch, FaPlus, FaChevronRight, FaCalendarAlt, FaPlane } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
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

  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'date_desc', label: 'Date (Newest)' },
    { value: 'date_asc', label: 'Date (Oldest)' },
    { value: 'depart_asc', label: 'Departure Time (Earliest)' },
    { value: 'depart_desc', label: 'Departure Time (Latest)' },
    { value: 'flight_az', label: 'Flight Number (A-Z)' },
    { value: 'flight_za', label: 'Flight Number (Z-A)' },
    { value: 'status', label: 'Status' },
    { value: 'aircraft', label: 'Aircraft (A-Z)' },
    { value: 'id_asc', label: 'Flight ID (Lowest)' },
    { value: 'id_desc', label: 'Flight ID (Highest)' },
  ];
  const [sortBy, setSortBy] = useState('default');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortBtnRef = useRef<HTMLButtonElement>(null);

  const navigate = useNavigate();

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

  // ฟังก์ชัน sort
  const sortFlights = (flights: ApiFlight[]) => {
    const sorted = [...flights];
    switch (sortBy) {
      case 'default':
        // ไม่ต้อง sort เพิ่มเติม
        break;
      case 'date_desc':
        sorted.sort((a, b) => new Date(b.departure_time || 0).getTime() - new Date(a.departure_time || 0).getTime());
        break;
      case 'date_asc':
        sorted.sort((a, b) => new Date(a.departure_time || 0).getTime() - new Date(b.departure_time || 0).getTime());
        break;
      case 'depart_asc':
        sorted.sort((a, b) => {
          const at = a.departure_time ? new Date(a.departure_time).getHours() * 60 + new Date(a.departure_time).getMinutes() : 0;
          const bt = b.departure_time ? new Date(b.departure_time).getHours() * 60 + new Date(b.departure_time).getMinutes() : 0;
          return at - bt;
        });
        break;
      case 'depart_desc':
        sorted.sort((a, b) => {
          const at = a.departure_time ? new Date(a.departure_time).getHours() * 60 + new Date(a.departure_time).getMinutes() : 0;
          const bt = b.departure_time ? new Date(b.departure_time).getHours() * 60 + new Date(b.departure_time).getMinutes() : 0;
          return bt - at;
        });
        break;
      case 'flight_az':
        sorted.sort((a, b) => (a.flight_number || '').localeCompare(b.flight_number || ''));
        break;
      case 'flight_za':
        sorted.sort((a, b) => (b.flight_number || '').localeCompare(a.flight_number || ''));
        break;
      case 'status':
        sorted.sort((a, b) => (a.flight_status || '').localeCompare(b.flight_status || ''));
        break;
      case 'aircraft':
        sorted.sort((a, b) => (a.aircraft?.model || '').localeCompare(b.aircraft?.model || ''));
        break;
      case 'id_asc':
        sorted.sort((a, b) => (a.flight_id || 0) - (b.flight_id || 0));
        break;
      case 'id_desc':
        sorted.sort((a, b) => (b.flight_id || 0) - (a.flight_id || 0));
        break;
      default:
        break;
    }
    return sorted;
  };

  // ให้ pagedFlights ใช้ filteredFlights ถ้าเคยค้นหา (filteredFlights !== null)
  const flightsToShow = filteredFlights !== null
    ? filteredFlights
    : flights;
  const sortedFlights = sortFlights(flightsToShow);
  const totalPages = Math.ceil(sortedFlights.length / pageSize);
  const pagedFlights = sortedFlights.slice((page - 1) * pageSize, page * pageSize);

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

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sortBtnRef.current && !sortBtnRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    if (sortDropdownOpen) {
      document.addEventListener('click', handleClick);
    }
    return () => document.removeEventListener('click', handleClick);
  }, [sortDropdownOpen]);

  const handleFlightClick = (flightId: number) => {
    navigate(`/admin/flights/${flightId}`);
  };

  const handleAddNewClick = () => {
    navigate('/admin/flights/new');
  };

  return (
    <div className={styles['flight-page']}>
      <div className={styles.breadcrumb}>
        <Link to="/admin">Dashboard</Link>
        <FaChevronRight className={styles['breadcrumb-separator']} />
        <span>Flight</span>
      </div>

      <div className={styles['content-wrapper']}>
        <div className={styles['page-header']}>
          <h2>Flight</h2>
        </div>

        <form className={styles['search-section']} onSubmit={handleSubmit} autoComplete="off">
          <h3>Search Flights</h3>
          
          <div className={styles['search-grid']}>
            <div className={styles['search-row']}>
              <div className={styles['form-group']}>
                <label>Route Information</label>
                <div className={styles['route-inputs']}>
                  <div className={styles['input-with-icon']} style={{ position: 'relative' }}>
                    <FaPlane className={styles['input-icon']} />
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
                  <div className={styles['input-with-icon']} style={{ position: 'relative' }}>
                    <FaPlane className={styles['input-icon']} />
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

            <div className={styles['search-row']}>
              <div className={styles['form-group']}>
                <label>Flight Details</label>
                <div className={styles['flight-details-inputs']}>
                  <div className={styles['input-with-icon']}>
                    <FaCalendarAlt className={styles['input-icon']} />
                    <input
                      name="date"
                      type="date"
                      value={searchData.date}
                      onChange={handleInputChange}
                      onFocus={e => e.target.showPicker && e.target.showPicker()}
                    />
                  </div>
                  <div className={styles['input-with-icon']} style={{ position: 'relative' }}>
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
            <div className={styles['search-row']} style={{ justifyContent: 'flex-end' }}>
              <button type="submit" className={styles['search-button']}>
                <FaSearch /> Search Flights
              </button>
              {filteredFlights !== null && (
                <button type="button" className={styles['search-button']} style={{ marginLeft: 8, background: '#f3f6fa', color: '#2563eb', border: '1.5px solid #e5eaf2' }} onClick={handleReset}>
                  Clear
                </button>
              )}
            </div>
          </div>
        </form>

        <div className={styles['table-actions']}>
          <button className={styles['add-new-button']} onClick={handleAddNewClick}>
            <FaPlus /> Add new
          </button>
          <div className={styles['sortby-dropdown-wrapper']} style={{ position: 'relative' }}>
            <button
              ref={sortBtnRef}
              type="button"
              className={styles['sortby-btn']}
              onClick={() => setSortDropdownOpen(open => !open)}
              style={{ minWidth: 160, height: 38, borderRadius: 10, border: '1.5px solid #e5eaf2', fontWeight: 600, color: '#2563eb', background: '#fff', marginLeft: 8, marginRight: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', cursor: 'pointer', boxShadow: sortDropdownOpen ? '0 2px 8px 0 rgba(59,130,246,0.10)' : 'none' }}
            >
              Sort by: {sortOptions.find(opt => opt.value === sortBy)?.label || 'Default'}
              <span style={{ marginLeft: 8, fontSize: 16, transition: 'transform 0.18s', transform: sortDropdownOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
            </button>
            {sortDropdownOpen && (
              <ul className={styles['sortby-dropdown-menu']} style={{ position: 'absolute', top: 44, left: 0, right: 0, zIndex: 20, background: '#fff', border: '1.5px solid #e5eaf2', borderRadius: 10, boxShadow: '0 4px 16px 0 rgba(59,130,246,0.07)', padding: 0, margin: 0, listStyle: 'none', overflow: 'hidden' }}>
                {sortOptions.map(opt => (
                  <li
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value);
                      setSortDropdownOpen(false);
                      setPage(1);
                    }}
                    style={{ padding: '12px 20px', fontSize: 15, color: opt.value === sortBy ? '#2563eb' : '#334155', fontWeight: opt.value === sortBy ? 700 : 500, background: opt.value === sortBy ? '#f0f9ff' : '#fff', cursor: 'pointer', borderBottom: '1px solid #f3f6fa', transition: 'background 0.15s, color 0.15s' }}
                  >
                    {opt.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className={styles['table-container']}>
          {loading ? (
            <div className={styles['flight-table-empty']}>Loading...</div>
          ) : error ? (
            <div className={styles['flight-table-empty']}>{error}</div>
          ) : filteredFlights !== null && pagedFlights.length === 0 ? (
            <div className={styles['flight-table-empty']}>No matching records found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Flight ID</th>
                  <th>Flight_number</th>
                  <th className={styles['aircraft']}>Aircraft</th>
                  <th className={styles['route']}>Route</th>
                  <th>Date</th>
                  <th>Depart</th>
                  <th>Arrival</th>
                  <th className={styles['remark']}>Remark</th>
                </tr>
              </thead>
              <tbody>
                {pagedFlights.map((flight) => (
                  <tr 
                    key={flight.flight_id}
                    onClick={() => handleFlightClick(flight.flight_id)}
                    className={styles['flight-row']}
                  >
                    <td>
                      <span className={`${styles['status-badge']} ${flight.flight_status?.toLowerCase()}`}>{flight.flight_status}</span>
                    </td>
                    <td>{flight.flight_id}</td>
                    <td>{flight.flight_number}</td>
                    <td className={styles['aircraft']}>{flight.aircraft?.model ?? '-'}</td>
                    <td className={styles['route']}>
                      {flight.route?.from_airport?.iata_code && flight.route?.to_airport?.iata_code
                        ? `${flight.route.from_airport.iata_code} → ${flight.route.to_airport.iata_code}`
                        : '-'}
                    </td>
                    <td>{flight.departure_time ? new Date(flight.departure_time).toLocaleDateString('th-TH') : '-'}</td>
                    <td>{flight.departure_time ? new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td>{flight.arrival_time ? new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                    <td
                      className={styles['remark']}
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
          <div className={styles['table-pagination']}>
            <div className={styles['page-size']}>
              Show
              <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              entries
            </div>
            <div className={styles['page-controls']}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
              <span className={styles['page-info']}>Page {page} / {totalPages || 1}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightPage; 