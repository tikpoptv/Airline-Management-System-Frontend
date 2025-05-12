import { FilterStatus, Flight } from '../../../../types/flight_dashboard';
import { useNavigate } from 'react-router-dom';
import styles from './FlightDetailsModal.module.css';

interface FlightDetailsModalProps {
  type: FilterStatus;
  flights: Flight[];
  onClose: () => void;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'On Time':
    case 'Scheduled':
    case 'Boarding':
      return '#10b981'; // เขียว
    case 'Delayed':
      return '#f59e0b'; // ส้ม
    case 'Cancelled':
      return '#ef4444'; // แดง
    default:
      return '#6b7280'; // เทา
  }
};

const getModalTitle = (type: FilterStatus): string => {
  switch (type) {
    case 'all':
      return 'Total Flights Today';
    case 'active':
      return 'Active Flights';
    case 'delayed':
      return 'Delayed Flights';
    case 'cancelled':
      return 'Cancelled Flights';
    default:
      return 'Flights';
  }
};

const getFilteredFlights = (flights: Flight[], type: FilterStatus): Flight[] => {
  switch (type) {
    case 'all':
      return flights;
    case 'active':
      return flights.filter(f => ['Scheduled', 'Boarding'].includes(f.flight_status));
    case 'delayed':
      return flights.filter(f => f.flight_status === 'Delayed');
    case 'cancelled':
      return flights.filter(f => f.flight_status === 'Cancelled');
    default:
      return flights;
  }
};

const FlightDetailsModal = ({ type, flights, onClose }: FlightDetailsModalProps) => {
  const navigate = useNavigate();
  const filteredFlights = getFilteredFlights(flights, type);

  const handleRowClick = (flightId: number) => {
    navigate(`/admin/flights/${flightId}`);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{getModalTitle(type)}</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        <div className={styles.modalContent}>
          <table className={styles.flightTable}>
            <thead>
              <tr>
                <th>Flight No.</th>
                <th>Route</th>
                <th>Departure</th>
                <th>Arrival</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredFlights.map((flight) => (
                <tr 
                  key={flight.flight_id}
                  onClick={() => handleRowClick(flight.flight_id)}
                  className={styles.clickableRow}
                >
                  <td>{flight.flight_number}</td>
                  <td>
                    {flight.route.from_airport.iata_code} - {flight.route.to_airport.iata_code}
                    <div className={styles.routeDetail}>
                      {flight.route.from_airport.city} to {flight.route.to_airport.city}
                    </div>
                  </td>
                  <td>
                    {new Date(flight.departure_time).toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    <div className={styles.dateDetail}>
                      {new Date(flight.departure_time).toLocaleDateString('th-TH')}
                    </div>
                  </td>
                  <td>
                    {new Date(flight.arrival_time).toLocaleTimeString('th-TH', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    <div className={styles.dateDetail}>
                      {new Date(flight.arrival_time).toLocaleDateString('th-TH')}
                    </div>
                  </td>
                  <td>
                    <span
                      className={styles.status}
                      style={{ backgroundColor: getStatusColor(flight.flight_status) }}
                    >
                      {flight.flight_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FlightDetailsModal; 