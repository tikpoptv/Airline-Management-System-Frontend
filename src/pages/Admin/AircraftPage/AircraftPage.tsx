import './AircraftPage.css';
import { FaPlane, FaEye, FaRegBuilding } from "react-icons/fa";
import SearchBar from "../../../components/SearchBar";
import { useEffect, useState } from "react";
import { getAircraftList } from "../../../services/aircraft/aircraftService";
import { getFlightsByAircraftId } from "../../../services/flight/flightService";
import { Aircraft } from "../../../types/aircraft";
import { Flight } from "../../../types/flight";

const AircraftPage = () => {
  const [aircraftList, setAircraftList] = useState<Aircraft[]>([]);
  const [flightList, setFlightList] = useState<Flight[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);
  const [sortOption, setSortOption] = useState<'date' | 'status'>('date');
  const [flightFilter, setFlightFilter] = useState<'all' | 'today'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAircrafts = async () => {
      try {
        const data = await getAircraftList();
        setAircraftList(data);
      } catch (err) {
        console.error("Failed to load aircraft data:", err);
        setError("ไม่สามารถโหลดข้อมูลเครื่องบินได้");
      }
    };
    fetchAircrafts();
  }, []);

  useEffect(() => {
    const fetchFlights = async () => {
      if (!selectedAircraft) return;
      try {
        const data = await getFlightsByAircraftId(selectedAircraft.aircraft_id);
        setFlightList(data);
      } catch (err) {
        console.error("Failed to load flights:", err);
        setFlightList([]);
      }
    };
    fetchFlights();
  }, [selectedAircraft]);

  const getFilteredAndSortedFlights = (): Flight[] => {
    let filtered = [...flightList];

    if (flightFilter === 'today') {
      const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
      filtered = filtered.filter((flight) =>
        flight.departure_time.startsWith(today)
      );
    }

    const statusOrder = {
      Scheduled: 1,
      Boarding: 2,
      Delayed: 3,
      Completed: 4,
      Cancelled: 5
    };

    if (sortOption === 'date') {
      filtered.sort((a, b) =>
        new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime()
      );
    } else if (sortOption === 'status') {
      filtered.sort(
        (a, b) =>
          statusOrder[a.flight_status] - statusOrder[b.flight_status]
      );
    }

    return filtered;
  };

  return (
    <div className="aircraft-page">
      {error && <div className="error-message">{error}</div>}

      {!selectedAircraft ? (
        <div>
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
                  className={`edit-button ${isEditing ? "done-button" : ""}`}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Done" : "Edit"}
                </button>
              </div>
            </div>
          </div>

          <table className="aircraft-table">
            <thead>
              <tr>
                {isEditing && <th></th>}
                <th>Aircraft ID</th>
                <th>Model</th>
                <th>Owner</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {aircraftList.map((air) => (
                <tr key={air.aircraft_id}>
                  {isEditing && <td><input type="checkbox" /></td>}
                  <td>{air.aircraft_id}</td>
                  <td><FaPlane className="plane-icon" /> {air.model}</td>
                  <td>{air.airline_owner}</td>
                  <td>
                    <FaEye
                      className="detail-icon"
                      onClick={() => setSelectedAircraft(air)}
                      style={{ cursor: "pointer" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="aircraft-detail">
          <button className="close-button" onClick={() => setSelectedAircraft(null)}>
            ← Back
          </button>

          <h3 style={{ fontSize: "25px" }}>Aircraft Profile</h3>
          <div className="profile-card">
            <div className="profile-avatar"><FaRegBuilding /></div>
            <div className="profile-fields">
              <div><strong>Model:</strong> {selectedAircraft.model}</div>
              <div><strong>Aircraft ID:</strong> {selectedAircraft.aircraft_id}</div>
              <div><strong>Owner:</strong> {selectedAircraft.airline_owner}</div>
              <div><strong>Year:</strong> {selectedAircraft.manufacture_year}</div>
              <div><strong>Capacity:</strong> {selectedAircraft.capacity}</div>
              <div><strong>Status:</strong> {selectedAircraft.maintenance_status}</div>
              <div><strong>History:</strong> {selectedAircraft.aircraft_history}</div>
            </div>
          </div>

          <h4 style={{ fontSize: "25px" }}>Flight Schedule</h4>
          <div className="filter-sort-bar">
            <div className="dropdown-group">
              <label htmlFor="filter">Filter:</label>
              <div className="dropdown-control">
                <select
                  id="filter"
                  value={flightFilter}
                  onChange={(e) => setFlightFilter(e.target.value as 'all' | 'today')}
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
                  onChange={(e) => setSortOption(e.target.value as 'date' | 'status')}
                >
                  <option value="date">Departure Time</option>
                  <option value="status">Flight Status</option>
                </select>
              </div>
            </div>
          </div>

          <table className="schedule-table">
            <thead>
              <tr className="task-row">
                <td colSpan={6}><h3><strong>Flight Tasks</strong></h3></td>
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
              {getFilteredAndSortedFlights().length > 0 ? (
                getFilteredAndSortedFlights().map((flight) => (
                  <tr key={flight.flight_id}>
                    <td className={`flight-status ${flight.flight_status}`}>
                      {flight.flight_status}
                    </td>
                    <td>{flight.flight_number}</td>
                    <td>{new Date(flight.departure_time).toLocaleDateString('th-TH', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}</td>
                    <td>{flight.route.from_airport.iata_code}</td>
                    <td>{flight.route.to_airport.iata_code}</td>
                    <td>
                      {new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} →{" "}
                      {new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        </div>
      )}
    </div>
  );
};

export default AircraftPage;
