import React from 'react';
import styles from './PassengerDetailModal.module.css';
import { flightService, PassengerDetail } from '../../../../../services/flight/flightService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  passengerId: number;
}

const PassengerDetailModal: React.FC<Props> = ({ isOpen, onClose, passengerId }) => {
  const [passengerData, setPassengerData] = React.useState<PassengerDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchPassengerData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await flightService.getPassengerDetails(passengerId);
        setPassengerData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && passengerId) {
      fetchPassengerData();
    }
  }, [isOpen, passengerId]);

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      date: date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    };
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        
        {loading && (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading passenger details...</p>
          </div>
        )}

        {error && (
          <div className={styles.errorState}>
            <span className={styles.errorIcon}>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {passengerData && (
          <div className={styles.passengerInfo}>
            <h2>Passenger Information</h2>
            
            <div className={styles.infoSection}>
              <h3>Personal Details</h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Name</label>
                  <span>{passengerData.name}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Passport Number</label>
                  <span>{passengerData.passport_number}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Nationality</label>
                  <span>{passengerData.nationality}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Special Requests</label>
                  <span>{passengerData.special_requests || '-'}</span>
                </div>
              </div>
            </div>

            <div className={styles.infoSection}>
              <h3>Flight Details</h3>
              <div className={styles.flightInfo}>
                <div className={styles.flightNumber}>
                  Flight {passengerData.flight_details.flight_number}
                </div>
                
                <div className={styles.routeInfo}>
                  <div className={styles.airport}>
                    <div className={styles.airportCode}>
                      {passengerData.flight_details.route.from_airport.iata_code}
                    </div>
                    <div className={styles.airportName}>
                      {passengerData.flight_details.route.from_airport.city}
                    </div>
                    <div className={styles.time}>
                      {formatDate(passengerData.flight_details.departure_time).time}
                    </div>
                    <div className={styles.date}>
                      {formatDate(passengerData.flight_details.departure_time).date}
                    </div>
                  </div>

                  <div className={styles.flightPath}>
                    <span className={styles.arrow}>→</span>
                  </div>

                  <div className={styles.airport}>
                    <div className={styles.airportCode}>
                      {passengerData.flight_details.route.to_airport.iata_code}
                    </div>
                    <div className={styles.airportName}>
                      {passengerData.flight_details.route.to_airport.city}
                    </div>
                    <div className={styles.time}>
                      {formatDate(passengerData.flight_details.arrival_time).time}
                    </div>
                    <div className={styles.date}>
                      {formatDate(passengerData.flight_details.arrival_time).date}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PassengerDetailModal; 