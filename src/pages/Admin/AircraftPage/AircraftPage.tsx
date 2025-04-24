// src/pages/Admin/AircraftPage/AircraftPage.tsx
import './AircraftPage.css';
import { FaPlane, FaEye, FaRegBuilding } from 'react-icons/fa';
import SearchBar from '../../../components/SearchBar';
import Loading from '../../../components/Loading';
import { useEffect, useState } from 'react';
import { getAircraftList } from '../../../services/aircraft/aircraftService';
import { getFlightsByAircraftId } from '../../../services/flight/flightService';
import { Aircraft } from '../../../types/aircraft';
import { Flight } from '../../../types/flight';

const AircraftPage = () => {
  /* ------------------------------ state ------------------------------ */
  const [aircraftList, setAircraftList] = useState<Aircraft[]>([]);
  const [flightList, setFlightList] = useState<Flight[]>([]);
  const [loadingAircrafts, setLoadingAircrafts] = useState(false);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(
    null
  );
  const [sortOption, setSortOption] = useState<'date' | 'status'>('date');
  const [flightFilter, setFlightFilter] = useState<'all' | 'today'>('all');
  const [error, setError] = useState<string | null>(null);

  /* -------------------------- load aircrafts ------------------------- */
  useEffect(() => {
    const fetchAircrafts = async () => {
      setLoadingAircrafts(true);
      try {
        const data = await getAircraftList();
        setAircraftList(data);
      } catch {
        setError('ไม่สามารถโหลดข้อมูลเครื่องบินได้');
      } finally {
        setLoadingAircrafts(false);
      }
    };
    fetchAircrafts();
  }, []);

  /* --------------------------- load flights -------------------------- */
  useEffect(() => {
    const fetchFlights = async () => {
      if (!selectedAircraft) return;
      setLoadingFlights(true);
      try {
        const data = await getFlightsByAircraftId(selectedAircraft.aircraft_id);
        setFlightList(data);
      } catch {
        setFlightList([]);
      } finally {
        setLoadingFlights(false);
      }
    };
    fetchFlights();
  }, [selectedAircraft]);

  /* ----------------------- helper : filter/sort ---------------------- */
  const getFilteredAndSortedFlights = (): Flight[] => {
    let filtered = [...flightList];

    if (flightFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter((f) => f.departure_time.startsWith(today));
    }

    const statusOrder: Record<string, number> = {
      Scheduled: 1,
      Boarding: 2,
      Delayed: 3,
      Completed: 4,
      Cancelled: 5,
    };

    filtered.sort((a, b) =>
      sortOption === 'date'
        ? new Date(a.departure_time).getTime() -
          new Date(b.departure_time).getTime()
        : statusOrder[a.flight_status] - statusOrder[b.flight_status]
    );

    return filtered;
  };

  /* ------------------------------- JSX -------------------------------- */
  return (
    <div className="aircraft-page">
      {error && <div className="error-message">{error}</div>}

      {/* ------------------------ aircraft list ------------------------ */}
      {!selectedAircraft ? (
        <>
          <div className="aircraft-header">
            <div className="title-group">
              <h4>Aircraft</h4>
              <h2 className="title">Aircraft Management</h2>
            </div>
            <div className="header-actions">
              <SearchBar />
              <div className="button-group">
                {isEditing && (
                  <>
                    <button className="add-button">Add New</button>
                    <button className="delete-button">Delete</button>
                  </>
                )}
                <button
                  className={`edit-button ${isEditing ? 'done-button' : ''}`}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Done' : 'Edit'}
                </button>
              </div>
            </div>
          </div>

          {loadingAircrafts ? (
            <Loading message="Loading plane..." />
          ) : (
            <table className="aircraft-table">
              <thead>
                <tr>
                  {isEditing && <th />}
                  <th>Aircraft ID</th>
                  <th>Model</th>
                  <th>Owner</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {aircraftList.map((air) => (
                  <tr key={air.aircraft_id}>
                    {isEditing && (
                      <td>
                        <input type="checkbox" />
                      </td>
                    )}
                    <td>{air.aircraft_id}</td>
                    <td>
                      <FaPlane className="plane-icon" /> {air.model}
                    </td>
                    <td>{air.airline_owner}</td>
                    <td>
                      <FaEye
                        className="detail-icon"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedAircraft(air)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      ) : (
        /* ----------------------- aircraft detail ---------------------- */
        <div className="aircraft-detail">
          <button
            className="close-button"
            onClick={() => setSelectedAircraft(null)}
          >
            ← Back
          </button>

          <h3 style={{ fontSize: 25 }}>Aircraft Profile</h3>
          <div className="profile-card">
            <div className="profile-avatar">
              <FaRegBuilding />
            </div>
            <div className="profile-fields">
              <div>
                <strong>Model:</strong> {selectedAircraft.model}
              </div>
              <div>
                <strong>Aircraft ID:</strong> {selectedAircraft.aircraft_id}
              </div>
              <div>
                <strong>Owner:</strong> {selectedAircraft.airline_owner}
              </div>
              <div>
                <strong>Year:</strong> {selectedAircraft.manufacture_year}
              </div>
              <div>
                <strong>Capacity:</strong> {selectedAircraft.capacity}
              </div>
              <div>
                <strong>Status:</strong> {selectedAircraft.maintenance_status}
              </div>
              <div>
                <strong>History:</strong> {selectedAircraft.aircraft_history}
              </div>
            </div>
          </div>

          <h4 style={{ fontSize: 25 }}>Flight Schedule</h4>

          {/* -------- filter & sort bar -------- */}
          <div className="filter-sort-bar">
            <div className="dropdown-group">
              <label htmlFor="filter">Filter:</label>
              <div className="dropdown-control">
                <select
                  id="filter"
                  value={flightFilter}
                  onChange={(e) =>
                    setFlightFilter(e.target.value as 'all' | 'today')
                  }
                >
                  <option value="all">All Flights</option>
                  <option value="today">Today Only</option>
                </select>
              </div>
            </div>

            <div className="dropdown-group">
              <label htmlFor="sort">Sort by:</label>
              <div className="dropdown-control">
                <select
                  id="sort"
                  value={sortOption}
                  onChange={(e) =>
                    setSortOption(e.target.value as 'date' | 'status')
                  }
                >
                  <option value="date">Departure Time</option>
                  <option value="status">Flight Status</option>
                </select>
              </div>
            </div>
          </div>

          {/* -------- flight table / loader -------- */}
          {loadingFlights ? (
            <Loading message="Loading flight schedule..." />
          ) : (
            <table className="schedule-table">
              <thead>
                <tr className="task-row">
                  <td colSpan={6}>
                    <h3>
                      <strong>Flight Tasks</strong>
                    </h3>
                  </td>
                </tr>
                <tr>
                  <th>Status</th>
                  <th>Flight Number</th>
                  <th>Date</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredAndSortedFlights().length ? (
                  getFilteredAndSortedFlights().map((f) => (
                    <tr key={f.flight_id}>
                      <td className={`flight-status ${f.flight_status}`}>
                        {f.flight_status}
                      </td>
                      <td>{f.flight_number}</td>
                      <td>
                        {new Date(f.departure_time).toLocaleDateString(
                          'th-TH',
                          {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          }
                        )}
                      </td>
                      <td>{f.route.from_airport.iata_code}</td>
                      <td>{f.route.to_airport.iata_code}</td>
                      <td>
                        {new Date(f.departure_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {' → '}
                        {new Date(f.arrival_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center' }}>
                      No flight data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AircraftPage;
