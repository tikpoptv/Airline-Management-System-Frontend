import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaChevronRight, FaEdit, FaEllipsisV, FaPlane, FaClock } from 'react-icons/fa';
import styles from './FlightDetailPage.module.css';
import GlobeMap from '../RoutePage/components/GlobeMap/GlobeMap';
import { flightService } from '../../../services/flight/flightService';
import { Flight, CrewMember, Passenger } from './types';

const getZoomLevel = (distance: number): number => {
  if (distance < 1000) return 5;
  if (distance < 2000) return 4;
  if (distance < 3000) return 3.5;
  if (distance < 5000) return 3;
  return 2;
};

const FlightDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [flightDetail, setFlightDetail] = useState<Flight | null>(null);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return {
      date: date.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);

        const [flight, crew, passengerList] = await Promise.all([
          flightService.getFlightDetails(Number(id)),
          flightService.getFlightCrew(Number(id)),
          flightService.getFlightPassengers(Number(id))
        ]);

        setFlightDetail(flight);
        setCrewMembers(crew);
        setPassengers(passengerList);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch flight data';
        console.error('Error in data fetching:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading flight details...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <p>{error}</p>
      <Link to="/admin/flights" className="back-button">Back to Flights</Link>
    </div>
  );
  
  if (!flightDetail) return (
    <div className="not-found-container">
      <div className="not-found-icon">🔍</div>
      <p>Flight not found</p>
      <Link to="/admin/flights" className="back-button">Back to Flights</Link>
    </div>
  );

  const fromAirportMapped = {
    iata_code: flightDetail.route.from_airport.iata_code,
    name: flightDetail.route.from_airport.name,
    lat: flightDetail.route.from_airport.latitude,
    lon: flightDetail.route.from_airport.longitude,
    city: flightDetail.route.from_airport.city,
    country: flightDetail.route.from_airport.country
  };

  const toAirportMapped = {
    iata_code: flightDetail.route.to_airport.iata_code,
    name: flightDetail.route.to_airport.name,
    lat: flightDetail.route.to_airport.latitude,
    lon: flightDetail.route.to_airport.longitude,
    city: flightDetail.route.to_airport.city,
    country: flightDetail.route.to_airport.country
  };

  return (
    <div className={styles.flightDetailPage}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link to="/admin">Dashboard</Link>
        <FaChevronRight className={styles.breadcrumbSeparator} />
        <Link to="/admin/flights">Flights</Link>
        <FaChevronRight className={styles.breadcrumbSeparator} />
        <span>{flightDetail.flight_number}</span>
      </div>

      {/* Header Section */}
      <div className={styles.flightHeader}>
        <div className={styles.flightTitle}>
          <div className={styles.flightNumberSection}>
            <FaPlane className={styles.flightIcon} />
            <h1>Flight {flightDetail.flight_number}</h1>
            <span className={`${styles.flightStatus} ${styles[flightDetail.flight_status.toLowerCase()]}`}>
              {flightDetail.flight_status}
            </span>
          </div>
          <button className={styles.editButton}>
            <FaEdit /> Edit Flight
          </button>
        </div>
        
        <div className={styles.flightInfo}>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>Date</span>
            <span className={styles.infoValue}>
              {flightDetail.departure_time ? formatDateTime(flightDetail.departure_time).date : 'N/A'}
            </span>
          </div>
          <div className={styles.infoGroup}>
            <span className={styles.infoLabel}>PNR</span>
            <span className={styles.infoValue}>{flightDetail.flight_number}</span>
          </div>
        </div>
      </div>

      {/* Route Card */}
      <div className={styles.routeCard}>
        <div className={styles.routeInfo}>
          <div className={`${styles.airportInfo} ${styles.departure}`}>
            <div className={styles.airportHeader}>
              <h3>{flightDetail.route.from_airport.city}</h3>
              <span className={styles.airportCode}>{flightDetail.route.from_airport.iata_code}</span>
            </div>
            <div className={styles.airportDetails}>
              <div className={styles.airportName}>{flightDetail.route.from_airport.name}</div>
              <div className={styles.timeInfo}>
                <FaClock className={styles.timeIcon} />
                <span className={styles.time}>
                  {flightDetail.departure_time ? formatDateTime(flightDetail.departure_time).time : 'N/A'}
                </span>
                <span className={styles.date}>
                  {flightDetail.departure_time ? formatDateTime(flightDetail.departure_time).date : 'N/A'}
                </span>
              </div>
              <div className={styles.statusBadge}>
                <FaPlane className={styles.planeIcon} />
                Departure
              </div>
            </div>
          </div>

          <div className={styles.flightPath}>
            <div className={styles.pathLine}>
              <div className={styles.dot}></div>
              <div className={styles.line}></div>
              <div className={styles.flightStatusBox}>
                <div className={styles.timeDisplay}>
                  <div className={styles.timeValue}>
                    {flightDetail.departure_time ? formatDateTime(flightDetail.departure_time).time : 'N/A'}
                  </div>
                  <div className={styles.dateValue}>
                    {flightDetail.departure_time ? formatDateTime(flightDetail.departure_time).date : 'N/A'}
                  </div>
                  <div className={styles.timezone}>
                    {flightDetail.route.from_airport.timezone || 'Local Time'}
                  </div>
                </div>
                <div className={styles.flightIdentifier}>
                  <span className={styles.flightNumber}>{flightDetail.flight_number}</span>
                  {flightDetail.flight_status.toLowerCase() === 'delayed' && (
                    <div className={styles.delayBadge}>
                      <FaClock className={styles.delayIcon} />
                      <span>Delayed</span>
                    </div>
                  )}
                </div>
                <div className={styles.flightProgress}>
                  <div className={styles.progressBar}>
                    <div 
                      className={`${styles.progressFill} ${styles[flightDetail.flight_status.toLowerCase()]}`}
                      style={{ width: '45%' }}
                    ></div>
                  </div>
                  <div className={styles.flightDuration}>
                    <span>Duration: {flightDetail.route.estimated_duration}</span>
                  </div>
                </div>
              </div>
              <div className={styles.line}></div>
              <div className={styles.dot}></div>
            </div>
          </div>

          <div className={`${styles.airportInfo} ${styles.arrival}`}>
            <div className={styles.airportHeader}>
              <h3>{flightDetail.route.to_airport.city}</h3>
              <span className={styles.airportCode}>{flightDetail.route.to_airport.iata_code}</span>
            </div>
            <div className={styles.airportDetails}>
              <div className={styles.airportName}>{flightDetail.route.to_airport.name}</div>
              <div className={styles.timeInfo}>
                <FaClock className={styles.timeIcon} />
                <span className={styles.time}>
                  {flightDetail.arrival_time ? formatDateTime(flightDetail.arrival_time).time : 'N/A'}
                </span>
                <span className={styles.date}>
                  {flightDetail.arrival_time ? formatDateTime(flightDetail.arrival_time).date : 'N/A'}
                </span>
              </div>
              <div className={styles.statusBadge}>
                <FaPlane className={`${styles.planeIcon} ${styles.arrival}`} />
                Arrival
              </div>
            </div>
          </div>
        </div>

        <div className={styles.routeMapContainer}>
          <GlobeMap
            fromAirport={fromAirportMapped}
            toAirport={toAirportMapped}
            zoomLevel={getZoomLevel(flightDetail.route.distance)}
          />
        </div>
      </div>

      {/* Flight Information Cards */}
      <div className={styles.flightInfoGrid}>
        {/* Route Information */}
        <div className={styles.infoSection}>
          <div className={styles.sectionTitle}>
            <h3>Route Information</h3>
            <Link to={`/admin/pathways/routes/detail/${flightDetail.route.route_id}`} className={styles.viewDetailButton}>
              View Route Details
            </Link>
          </div>
          <div className={styles.infoCardsGroup}>
            <div className={styles.infoCard}>
              <div className={styles.cardIcon}>🛫</div>
              <div className={styles.cardContent}>
                <label>From</label>
                <span>{flightDetail.route.from_airport.iata_code}</span>
                <small>{flightDetail.route.from_airport.city}</small>
              </div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.cardIcon}>🛬</div>
              <div className={styles.cardContent}>
                <label>To</label>
                <span>{flightDetail.route.to_airport.iata_code}</span>
                <small>{flightDetail.route.to_airport.city}</small>
              </div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.cardIcon}>📏</div>
              <div className={styles.cardContent}>
                <label>Distance</label>
                <span>{flightDetail.route.distance.toFixed(0)} km</span>
              </div>
            </div>
          </div>
        </div>

        {/* Aircraft Information */}
        <div className={styles.infoSection}>
          <div className={styles.sectionTitle}>
            <h3>Aircraft Information</h3>
            <Link to={`/admin/aircrafts/${flightDetail.aircraft.aircraft_id}`} className={styles.viewDetailButton}>
              View Aircraft Details
            </Link>
          </div>
          <div className={styles.infoCardsGroup}>
            <div className={styles.infoCard}>
              <div className={styles.cardIcon}>✈️</div>
              <div className={styles.cardContent}>
                <label>Aircraft</label>
                <span>{flightDetail.aircraft.model}</span>
                <small>ID: {flightDetail.aircraft.aircraft_id}</small>
              </div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.cardIcon}>👥</div>
              <div className={styles.cardContent}>
                <label>Capacity</label>
                <span>{flightDetail.aircraft.capacity} seats</span>
              </div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.cardIcon}>🔧</div>
              <div className={styles.cardContent}>
                <label>Status</label>
                <span>{flightDetail.aircraft.maintenance_status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crew Section */}
      <div className={styles.flightDetails}>
        <div className={styles.sectionHeader}>
          <h2>Flight Crew</h2>
          <div className={styles.headerActions}>
            <button className={styles.addCrewButton}>+ Add Crew</button>
            <Link to="/admin/crews" className={styles.viewDetailButton}>View All Crew</Link>
          </div>
        </div>
        
        <div className={styles.tableContainer}>
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
              {crewMembers.map((crew) => (
                <tr key={crew.crew_id}>
                  <td>{crew.crew_id}</td>
                  <td className={styles.crewName}>{crew.name}</td>
                  <td>
                    <span className={styles.roleBadge}>{crew.role}</span>
                  </td>
                  <td>
                    <span className={styles.dutyBadge}>{crew.role_in_flight}</span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <Link to={`/admin/crews/${crew.crew_id}`} className={styles.actionButton}>
                        View Details
                      </Link>
                      <button className={styles.actionButton}>
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
      <div className={styles.flightDetails}>
        <div className={styles.sectionHeader}>
          <h2>Passengers</h2>
          <button className={styles.addPassengerButton}>+ Add Passenger</button>
        </div>
        <div className={styles.tableContainer}>
          {passengers.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>👥</div>
              <p>No passengers added yet</p>
              <button className={styles.addFirstButton}>Add First Passenger</button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Nationality</th>
                  <th>Special Requests</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {passengers.map((passenger) => (
                  <tr key={passenger.passenger_id}>
                    <td>{passenger.passenger_id}</td>
                    <td className={styles.passengerName}>{passenger.name}</td>
                    <td>{passenger.nationality}</td>
                    <td>
                      {passenger.special_requests ? (
                        <span className={styles.specialRequestBadge}>{passenger.special_requests}</span>
                      ) : (
                        <span className={styles.noRequests}>-</span>
                      )}
                    </td>
                    <td>
                      <button className={styles.actionButton}>
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