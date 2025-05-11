import { useState } from 'react';
import styles from './FlightDetailsModal.module.css';
import { FaTimes } from 'react-icons/fa';

interface FlightDetailsModalProps {
  type: 'total' | 'active' | 'delayed' | 'cancelled';
  onClose: () => void;
}

const FlightDetailsModal = ({ type, onClose }: FlightDetailsModalProps) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'domestic' | 'international'>('all');

  const getTitle = () => {
    switch (type) {
      case 'total':
        return 'Total Flights Today';
      case 'active':
        return 'Active Flights';
      case 'delayed':
        return 'Delayed Flights';
      case 'cancelled':
        return 'Cancelled Flights';
    }
  };

  // Mock data - ในการใช้งานจริงควรรับข้อมูลจาก API
  const mockFlights = [
    {
      id: 'TH101',
      route: 'BKK - CNX',
      departure: '10:00',
      arrival: '11:30',
      status: type === 'delayed' ? 'Delayed (30m)' : type === 'cancelled' ? 'Cancelled' : 'On Time',
      type: 'domestic'
    },
    {
      id: 'TH203',
      route: 'BKK - HKG',
      departure: '12:15',
      arrival: '16:00',
      status: type === 'delayed' ? 'Delayed (45m)' : type === 'cancelled' ? 'Cancelled' : 'On Time',
      type: 'international'
    },
    // เพิ่มข้อมูลตัวอย่างตามต้องการ
  ];

  const filteredFlights = mockFlights.filter(
    flight => selectedFilter === 'all' || flight.type === selectedFilter
  );

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{getTitle()}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${selectedFilter === 'all' ? styles.active : ''}`}
            onClick={() => setSelectedFilter('all')}
          >
            All Flights
          </button>
          <button
            className={`${styles.filterButton} ${selectedFilter === 'domestic' ? styles.active : ''}`}
            onClick={() => setSelectedFilter('domestic')}
          >
            Domestic
          </button>
          <button
            className={`${styles.filterButton} ${selectedFilter === 'international' ? styles.active : ''}`}
            onClick={() => setSelectedFilter('international')}
          >
            International
          </button>
        </div>

        <div className={styles.flightList}>
          <table>
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
              {filteredFlights.map(flight => (
                <tr key={flight.id}>
                  <td>{flight.id}</td>
                  <td>{flight.route}</td>
                  <td>{flight.departure}</td>
                  <td>{flight.arrival}</td>
                  <td>
                    <span className={`${styles.status} ${styles[type]}`}>
                      {flight.status}
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