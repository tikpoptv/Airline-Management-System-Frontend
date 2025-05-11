import { useState } from 'react';
import { FaPlane, FaUsers, FaWrench, FaRoute, FaMapLocationDot } from 'react-icons/fa6';
import { MdFlightTakeoff, MdFlightLand } from 'react-icons/md';
import { TbPlaneOff } from 'react-icons/tb';
import styles from './DashboardPage.module.css';
import StatCard from './components/StatCard';
import FlightChart from './components/FlightChart';
import MaintenanceChart from './components/MaintenanceChart';
import CrewSchedule from './components/CrewSchedule';
import WeatherWidget from './components/WeatherWidget';
import NotificationList from './components/NotificationList';
import FlightMap from './components/FlightMap';
import FlightDetailsModal from './components/FlightDetailsModal';
import { Notification } from './types';

// Mock data
const mockStats = {
  totalFlights: 156,
  activeFlights: 24,
  delayedFlights: 3,
  cancelledFlights: 1,
  totalAircrafts: 45,
  activeAircrafts: 38,
  maintenanceAircrafts: 7,
  totalCrews: 320,
  activeCrews: 180,
  totalRoutes: 89,
  activeRoutes: 76,
  totalAirports: 120
};

const mockNotifications: Notification[] = [
  { id: 1, type: 'delay', message: 'Flight TH103 delayed by 30 minutes', time: '10 mins ago' },
  { id: 2, type: 'maintenance', message: 'Aircraft TH-789 due for maintenance', time: '25 mins ago' },
  { id: 3, type: 'weather', message: 'Strong winds at BKK airport', time: '1 hour ago' },
];

type ModalType = 'total' | 'active' | 'delayed' | 'cancelled' | null;

const DashboardPage = () => {
  const [selectedModal, setSelectedModal] = useState<ModalType>(null);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <div className={styles.dateTime}>
          {new Date().toLocaleDateString('th-TH', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          icon={<MdFlightTakeoff />}
          title="Total Flights Today"
          value={mockStats.totalFlights}
          trend={+12.5}
          onClick={() => setSelectedModal('total')}
        />
        <StatCard
          icon={<FaPlane />}
          title="Active Flights"
          value={mockStats.activeFlights}
          status="active"
          onClick={() => setSelectedModal('active')}
        />
        <StatCard
          icon={<MdFlightLand />}
          title="Delayed Flights"
          value={mockStats.delayedFlights}
          status="warning"
          onClick={() => setSelectedModal('delayed')}
        />
        <StatCard
          icon={<TbPlaneOff />}
          title="Cancelled Flights"
          value={mockStats.cancelledFlights}
          status="error"
          onClick={() => setSelectedModal('cancelled')}
        />
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.mapSection}>
          <div className={styles.sectionHeader}>
            <h2>Live Flight Map</h2>
            <span className={styles.activeFlight}>
              {mockStats.activeFlights} Active Flights
            </span>
          </div>
          <FlightMap />
        </div>

        <div className={styles.chartSection}>
          <div className={styles.sectionHeader}>
            <h2>Flight Statistics</h2>
          </div>
          <FlightChart />
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <div className={styles.statHeader}>
            <FaPlane className={styles.statIcon} />
            <h3>Aircraft Status</h3>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statItem}>
              <span>Total Aircraft</span>
              <strong>{mockStats.totalAircrafts}</strong>
            </div>
            <div className={styles.statItem}>
              <span>Active</span>
              <strong className={styles.active}>{mockStats.activeAircrafts}</strong>
            </div>
            <div className={styles.statItem}>
              <span>In Maintenance</span>
              <strong className={styles.maintenance}>{mockStats.maintenanceAircrafts}</strong>
            </div>
          </div>
        </div>

        <div className={styles.statBox}>
          <div className={styles.statHeader}>
            <FaUsers className={styles.statIcon} />
            <h3>Crew Status</h3>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statItem}>
              <span>Total Crew</span>
              <strong>{mockStats.totalCrews}</strong>
            </div>
            <div className={styles.statItem}>
              <span>On Duty</span>
              <strong className={styles.active}>{mockStats.activeCrews}</strong>
            </div>
          </div>
        </div>

        <div className={styles.statBox}>
          <div className={styles.statHeader}>
            <FaRoute className={styles.statIcon} />
            <h3>Routes & Airports</h3>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statItem}>
              <span>Active Routes</span>
              <strong>{mockStats.activeRoutes}/{mockStats.totalRoutes}</strong>
            </div>
            <div className={styles.statItem}>
              <span>Airports Served</span>
              <strong>{mockStats.totalAirports}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomGrid}>
        <div className={styles.maintenanceSection}>
          <div className={styles.sectionHeader}>
            <h2>Maintenance Overview</h2>
            <FaWrench />
          </div>
          <MaintenanceChart />
        </div>

        <div className={styles.crewSection}>
          <div className={styles.sectionHeader}>
            <h2>Crew Schedule</h2>
            <FaUsers />
          </div>
          <CrewSchedule />
        </div>

        <div className={styles.rightSection}>
          <div className={styles.weatherWidget}>
            <div className={styles.sectionHeader}>
              <h2>Weather Updates</h2>
              <FaMapLocationDot />
            </div>
            <WeatherWidget />
          </div>

          <div className={styles.notifications}>
            <div className={styles.sectionHeader}>
              <h2>Recent Notifications</h2>
            </div>
            <NotificationList notifications={mockNotifications} />
          </div>
        </div>
      </div>

      {selectedModal && (
        <FlightDetailsModal
          type={selectedModal}
          onClose={() => setSelectedModal(null)}
        />
      )}
    </div>
  );
};

export default DashboardPage; 