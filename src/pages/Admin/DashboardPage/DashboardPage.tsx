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
import { FilterStatus, Flight, Notification } from '../../../types/flight_dashboard';
import { useFlightDashboard } from '../../../hooks/useFlightDashboard';
import { useNavigate } from 'react-router-dom';

// Mock data - เฉพาะส่วนที่ยังไม่มี API
const mockNotifications: Notification[] = [
  { id: 1, type: 'delay', message: 'Flight TH103 delayed by 30 minutes', time: '10 mins ago' },
  { id: 2, type: 'maintenance', message: 'Aircraft TH-789 due for maintenance', time: '25 mins ago' },
  { id: 3, type: 'weather', message: 'Strong winds at BKK airport', time: '1 hour ago' },
];

const DashboardPage = () => {
  const [selectedModal, setSelectedModal] = useState<FilterStatus | null>(null);
  const { data, loading, error } = useFlightDashboard();
  const navigate = useNavigate();

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;
  if (error) return <div>เกิดข้อผิดพลาด: {error.message}</div>;
  if (!data) return null;

  const stats = {
    totalFlights: data.total_flights,
    activeFlights: data.flights.filter((f: Flight) => ['Scheduled', 'Boarding'].includes(f.flight_status)).length,
    delayedFlights: data.flights.filter((f: Flight) => f.flight_status === 'Delayed').length,
    cancelledFlights: data.flights.filter((f: Flight) => f.flight_status === 'Cancelled').length,
  };

  // กรองเฉพาะเที่ยวบินที่ active
  const activeFlights = data.flights.filter(
    f => ['Scheduled', 'Boarding'].includes(f.flight_status)
  );

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
          value={stats.totalFlights}
          onClick={() => setSelectedModal('all')}
        />
        <StatCard
          icon={<FaPlane />}
          title="Active Flights"
          value={stats.activeFlights}
          status="active"
          onClick={() => setSelectedModal('active')}
        />
        <StatCard
          icon={<MdFlightLand />}
          title="Delayed Flights"
          value={stats.delayedFlights}
          status="warning"
          onClick={() => setSelectedModal('delayed')}
        />
        <StatCard
          icon={<TbPlaneOff />}
          title="Cancelled Flights"
          value={stats.cancelledFlights}
          status="error"
          onClick={() => setSelectedModal('cancelled')}
        />
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.mapSection}>
          <div className={styles.sectionHeader}>
            <h2>Live Flight Map</h2>
            <span className={styles.activeFlight}>
              {stats.activeFlights} Active Flights
            </span>
          </div>
          <FlightMap flights={activeFlights} />
        </div>

        <div className={styles.chartSection}>
          <div className={styles.sectionHeader}>
            <h2>Flight Statistics</h2>
          </div>
          <FlightChart flights={data.flights} />
        </div>
      </div>

      <div className={styles.statsRow}>
        <div 
          className={`${styles.statBox} ${styles.clickable}`} 
          onClick={() => navigate('/admin/aircrafts')}
        >
          <div className={styles.statHeader}>
            <FaPlane className={styles.statIcon} />
            <h3>Aircraft Status</h3>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statItem}>
              <span>Total Aircraft</span>
              <strong>{data.total_aircrafts}</strong>
            </div>
            <div className={styles.statItem}>
              <span>Active</span>
              <strong className={styles.active}>{data.active_aircrafts}</strong>
            </div>
            <div className={styles.statItem}>
              <span>In Maintenance</span>
              <strong className={styles.maintenance}>{data.maintenance_aircrafts}</strong>
            </div>
          </div>
        </div>

        <div 
          className={`${styles.statBox} ${styles.clickable}`} 
          onClick={() => navigate('/admin/crew')}
        >
          <div className={styles.statHeader}>
            <FaUsers className={styles.statIcon} />
            <h3>Crew Status</h3>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statItem}>
              <span>Total Crew</span>
              <strong>{data.total_crews}</strong>
            </div>
            <div className={styles.statItem}>
              <span>On Duty</span>
              <strong className={styles.active}>{data.active_crews}</strong>
            </div>
          </div>
        </div>

        <div 
          className={`${styles.statBox} ${styles.clickable}`} 
          onClick={() => navigate('/admin/pathways/routes')}
        >
          <div className={styles.statHeader}>
            <FaRoute className={styles.statIcon} />
            <h3>Routes & Airports</h3>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statItem}>
              <span>Active Routes</span>
              <strong>{data.active_routes}/{data.total_routes}</strong>
            </div>
            <div className={styles.statItem}>
              <span>Airports Served</span>
              <strong>{data.total_airports}</strong>
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
          flights={data.flights}
          onClose={() => setSelectedModal(null)}
        />
      )}
    </div>
  );
};

export default DashboardPage; 