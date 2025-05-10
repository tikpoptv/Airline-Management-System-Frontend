import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaChevronRight, FaEdit, FaEllipsisV, FaPlane, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import './FlightDetailPage.css';

interface CrewMember {
  crew_id: number;
  name: string;
  passport_number: string;
  role: string;
  duty: string;
}

interface Airport {
  airport_id: number;
  iata_code: string;
  name: string;
  city: string;
  country: string;
}

interface Route {
  route_id: number;
  from_airport: Airport;
  to_airport: Airport;
  distance: number;
  estimated_duration: string;
}

interface Aircraft {
  aircraft_id: number;
  model: string;
  manufacture_year: number;
  capacity: number;
  airline_owner: string;
  maintenance_status: string;
  aircraft_history: string;
}

interface FlightDetail {
  flight_id: number;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  flight_status: string;
  cancellation_reason: string | null;
  aircraft: Aircraft;
  route: Route;
  cabin_crew: CrewMember[];
  passengers: CrewMember[];
}

const FlightDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [flightDetail, setFlightDetail] = useState<FlightDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return {
      date: date.toLocaleDateString('th-TH'),
      time: date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };
  };

  useEffect(() => {
    // TODO: Implement API call to fetch flight details
    // For now using mock data
    const mockData: FlightDetail = {
      flight_id: 41,
      flight_number: 'TG604',
      departure_time: '2025-03-19T13:35:48.839038Z',
      arrival_time: '2025-03-20T00:31:36.239038Z',
      flight_status: 'Scheduled',
      cancellation_reason: null,
      aircraft: {
        aircraft_id: 1,
        model: 'Boeing 777',
        manufacture_year: 2024,
        capacity: 353,
        airline_owner: 'Thai Airways',
        maintenance_status: 'In Maintenance',
        aircraft_history: 'Serious inside else memory if six. Whose group through despite cause.'
      },
      route: {
        route_id: 1,
        from_airport: {
          airport_id: 3,
          iata_code: 'HKT',
          name: 'Phuket International Airport',
          city: 'Phuket',
          country: 'Thailand'
        },
        to_airport: {
          airport_id: 23,
          iata_code: 'IST',
          name: 'Istanbul Airport',
          city: 'Istanbul',
          country: 'Turkey'
        },
        distance: 7709.89,
        estimated_duration: '08:33:59.56'
      },
      cabin_crew: [
        {
          crew_id: 3,
          name: 'John Doe',
          passport_number: 'P1234567',
          role: 'Pilot',
          duty: 'Captain'
        },
        {
          crew_id: 5,
          name: 'Sally Sky',
          passport_number: 'P9876543',
          role: 'Attendant',
          duty: 'Cabin Crew'
        }
      ],
      passengers: []
    };

    setFlightDetail(mockData);
    setLoading(false);
  }, [id]);

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading flight details...</p>
    </div>
  );
  
  if (!flightDetail) return (
    <div className="not-found-container">
      <div className="not-found-icon">🔍</div>
      <p>Flight not found</p>
      <Link to="/admin/flights" className="back-button">Back to Flights</Link>
    </div>
  );

  return (
    <div className="flight-detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/admin">Dashboard</Link>
        <FaChevronRight className="breadcrumb-separator" />
        <Link to="/admin/flights">Flight</Link>
        <FaChevronRight className="breadcrumb-separator" />
        <span>{flightDetail.flight_number}</span>
      </div>

      {/* Header Section */}
      <div className="flight-header">
        <div className="flight-title">
          <div className="flight-number-section">
            <FaPlane className="flight-icon" />
            <h1>Flight {flightDetail.flight_number}</h1>
            <span className={`flight-status ${flightDetail.flight_status.toLowerCase()}`}>
              {flightDetail.flight_status}
            </span>
          </div>
        </div>
        
        <div className="flight-info">
          <div className="info-group">
            <span className="info-label">Date</span>
            <span className="info-value">{flightDetail.departure_time ? formatDateTime(flightDetail.departure_time).date : 'N/A'}</span>
          </div>
          <div className="info-group">
            <span className="info-label">PNR</span>
            <span className="info-value">{flightDetail.flight_number}</span>
          </div>
          <button className="edit-button">
            <FaEdit /> Edit Flight
          </button>
        </div>
      </div>

      {/* Route Card */}
      <div className="route-card">
        <div className="route-info">
          <div className="airport-info departure">
            <div className="airport-code">{flightDetail.route.from_airport.iata_code}</div>
            <div className="airport-time">
              <FaClock className="time-icon" />
              {flightDetail.departure_time ? formatDateTime(flightDetail.departure_time).time : 'N/A'}
            </div>
            <div className="airport-marker">
              <FaMapMarkerAlt className="marker-icon" />
              Departure
            </div>
          </div>
          <div className="route-line">
            <div className="duration-badge">
              <FaClock className="duration-icon" />
              {flightDetail.route.estimated_duration}
            </div>
            <div className="line-with-plane">
              <div className="animated-plane">✈️</div>
            </div>
          </div>
          <div className="airport-info arrival">
            <div className="airport-code">{flightDetail.route.to_airport.iata_code}</div>
            <div className="airport-time">
              <FaClock className="time-icon" />
              {flightDetail.arrival_time ? formatDateTime(flightDetail.arrival_time).time : 'N/A'}
            </div>
            <div className="airport-marker">
              <FaMapMarkerAlt className="marker-icon" />
              Arrival
            </div>
          </div>
        </div>
      </div>

      {/* Flight Information Cards */}
      <div className="flight-info-grid">
        {/* Route Information */}
        <div className="info-section">
          <div className="section-title">
            <h3>Route Information</h3>
            <Link to={`/admin/routes/${flightDetail.route.route_id}`} className="view-detail-button">
              View Route Detail
            </Link>
          </div>
          <div className="info-cards-group">
            <div className="info-card">
              <div className="card-icon">🛫</div>
              <div className="card-content">
                <label>From</label>
                <span>{flightDetail.route.from_airport.iata_code}</span>
                <small>{flightDetail.route.from_airport.city}</small>
              </div>
            </div>
            <div className="info-card">
              <div className="card-icon">🛬</div>
              <div className="card-content">
                <label>To</label>
                <span>{flightDetail.route.to_airport.iata_code}</span>
                <small>{flightDetail.route.to_airport.city}</small>
              </div>
            </div>
            <div className="info-card">
              <div className="card-icon">📏</div>
              <div className="card-content">
                <label>Distance</label>
                <span>{flightDetail.route.distance.toFixed(0)} km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Aircraft Information */}
        <div className="info-section">
          <div className="section-title">
            <h3>Aircraft Information</h3>
            <Link to={`/admin/aircrafts/${flightDetail.aircraft.aircraft_id}`} className="view-detail-button">
              View Aircraft Detail
            </Link>
          </div>
          <div className="info-cards-group">
            <div className="info-card">
              <div className="card-icon">✈️</div>
              <div className="card-content">
                <label>Aircraft</label>
                <span>{flightDetail.aircraft.model}</span>
                <small>ID: {flightDetail.aircraft.aircraft_id}</small>
              </div>
            </div>
            <div className="info-card">
              <div className="card-icon">👥</div>
              <div className="card-content">
                <label>Capacity</label>
                <span>{flightDetail.aircraft.capacity} seats</span>
              </div>
            </div>
            <div className="info-card">
              <div className="card-icon">🔧</div>
              <div className="card-content">
                <label>Status</label>
                <span>{flightDetail.aircraft.maintenance_status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Airport Information */}
        <div className="info-section">
          <div className="section-title">
            <h3>Airport Details</h3>
            <div className="detail-buttons">
              <Link to={`/admin/airports/${flightDetail.route.from_airport.airport_id}`} className="view-detail-button">
                View Departure Airport
              </Link>
              <Link to={`/admin/airports/${flightDetail.route.to_airport.airport_id}`} className="view-detail-button">
                View Arrival Airport
              </Link>
            </div>
          </div>
          <div className="info-cards-group">
            <div className="info-card">
              <div className="card-icon">🏢</div>
              <div className="card-content">
                <label>Departure</label>
                <span>{flightDetail.route.from_airport.name}</span>
                <small>{flightDetail.route.from_airport.country}</small>
              </div>
            </div>
            <div className="info-card">
              <div className="card-icon">🏢</div>
              <div className="card-content">
                <label>Arrival</label>
                <span>{flightDetail.route.to_airport.name}</span>
                <small>{flightDetail.route.to_airport.country}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crew Section */}
      <div className="flight-details">
        <div className="section-header">
          <h2>Flight Crew</h2>
          <div className="header-actions">
            <button className="add-crew-button">+ Add Crew</button>
            <Link to="/admin/crews" className="view-detail-button">View All Crew</Link>
          </div>
        </div>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Duty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {flightDetail.cabin_crew.map((crew) => (
                <tr key={crew.crew_id}>
                  <td>{crew.crew_id}</td>
                  <td className="crew-name">{crew.name}</td>
                  <td>
                    <span className="role-badge">{crew.role}</span>
                  </td>
                  <td>
                    <span className="duty-badge">{crew.duty}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/admin/crews/${crew.crew_id}`} className="action-button">
                        View Detail
                      </Link>
                      <button className="action-button">
                        <FaEllipsisV />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Passengers Section */}
      <div className="flight-details">
        <div className="section-header">
          <h2>Passengers</h2>
          <button className="add-passenger-button">+ Add Passenger</button>
        </div>
        <div className="table-container">
          {flightDetail.passengers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <p>No passengers added yet</p>
              <button className="add-first-button">Add First Passenger</button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Seat</th>
                  <th>Class</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {flightDetail.passengers.map((passenger) => (
                  <tr key={passenger.crew_id}>
                    <td>{passenger.crew_id}</td>
                    <td className="passenger-name">{passenger.name}</td>
                    <td>{passenger.role}</td>
                    <td>
                      <span className="class-badge">{passenger.duty}</span>
                    </td>
                    <td>
                      <button className="action-button">
                        <FaEllipsisV />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlightDetailPage; 