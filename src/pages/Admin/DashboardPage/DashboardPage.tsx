import { useState } from 'react';
import { FaPlane, FaUsers, FaWrench, FaRoute, FaMapLocationDot } from 'react-icons/fa6';
import { MdFlightTakeoff, MdFlightLand } from 'react-icons/md';
import { TbPlaneOff } from 'react-icons/tb';
import { BsTicket, BsCreditCard } from 'react-icons/bs';
import { IoMdCheckmark } from 'react-icons/io';
import styles from './DashboardPage.module.css';
import StatCard from './components/StatCard';
import FlightChart from './components/FlightChart';
import MaintenanceChart from './components/MaintenanceChart';
import CrewSchedule from './components/CrewSchedule';
import FlightMap from './components/FlightMap';
import FlightDetailsModal from './components/FlightDetailsModal';
import TicketDetailsModal from './components/TicketDetailsModal';
import { FilterStatus, Flight } from '../../../types/flight_dashboard';
import { useFlightDashboard } from '../../../hooks/useFlightDashboard';
import { usePaymentDashboard } from '../../../hooks/usePaymentDashboard';
import { useNavigate } from 'react-router-dom';
import WeatherUpdates from '../../../components/WeatherUpdates';

const DashboardPage = () => {
  const [selectedModal, setSelectedModal] = useState<FilterStatus | null>(null);
  const [ticketModalType, setTicketModalType] = useState<'booking' | 'payment' | 'passenger' | null>(null);
  const { data, loading: flightLoading, error: flightError } = useFlightDashboard();
  const { stats: paymentStats, loading: paymentLoading, error: paymentError } = usePaymentDashboard();
  const navigate = useNavigate();

  if (flightLoading || paymentLoading) return <div>กำลังโหลดข้อมูล...</div>;
  if (flightError) return <div>เกิดข้อผิดพลาดกับข้อมูลเที่ยวบิน: {flightError.message}</div>;
  if (paymentError) return <div>เกิดข้อผิดพลาดกับข้อมูลการชำระเงิน: {paymentError.message}</div>;
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

  const openTicketModal = (type: 'booking' | 'payment' | 'passenger') => {
    setTicketModalType(type);
  };

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
          title="เที่ยวบินทั้งหมดวันนี้"
          value={stats.totalFlights}
          onClick={() => setSelectedModal('all')}
        />
        <StatCard
          icon={<FaPlane />}
          title="เที่ยวบินที่กำลังให้บริการ"
          value={stats.activeFlights}
          status="active"
          onClick={() => setSelectedModal('active')}
        />
        <StatCard
          icon={<MdFlightLand />}
          title="เที่ยวบินที่ล่าช้า"
          value={stats.delayedFlights}
          status="warning"
          onClick={() => setSelectedModal('delayed')}
        />
        <StatCard
          icon={<TbPlaneOff />}
          title="เที่ยวบินที่ยกเลิก"
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

      {/* Booking and Revenue Stats */}
      <div className={styles.statsRow}>
        <div 
          className={`${styles.statBox} ${styles.clickable}`}
          onClick={() => openTicketModal('booking')}
        >
          <div className={styles.statHeader}>
            <BsTicket className={styles.statIcon} />
            <h3>สถานะการจอง</h3>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statItem}>
              <span>การจองทั้งหมด</span>
              <strong>{paymentStats.totalBookings}</strong>
            </div>
            <div className={styles.statItem}>
              <span>ชำระเงินเรียบร้อย</span>
              <strong className={styles.active}>
                <IoMdCheckmark /> {paymentStats.completedPayments}
              </strong>
            </div>
            <div className={styles.statItem}>
              <span>รอชำระเงิน</span>
              <strong className={styles.warning}>{paymentStats.pendingPayments}</strong>
            </div>
          </div>
        </div>

        <div 
          className={`${styles.statBox} ${styles.clickable}`}
          onClick={() => openTicketModal('payment')}
        >
          <div className={styles.statHeader}>
            <BsCreditCard className={styles.statIcon} />
            <h3>รายได้</h3>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statItem}>
              <span>รายได้รวม</span>
              <strong className={styles.revenue}>
                ฿{paymentStats.totalRevenue.toLocaleString()}
              </strong>
            </div>
            <div className={styles.statItem}>
              <span>วิธีชำระเงินยอดนิยม</span>
              <strong>
                {paymentStats.revenueByMethod[0]?.method || 'ไม่มีข้อมูล'}
              </strong>
            </div>
          </div>
        </div>

        <div 
          className={`${styles.statBox} ${styles.clickable}`}
          onClick={() => openTicketModal('passenger')}
        >
          <div className={styles.statHeader}>
            <FaUsers className={styles.statIcon} />
            <h3>ผู้โดยสาร</h3>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statItem}>
              <span>จำนวนผู้โดยสารวันนี้</span>
              <strong>{paymentStats.completedPayments}</strong>
            </div>
            <div className={styles.statItem}>
              <span>การจองล่มเหลว</span>
              <strong className={styles.error}>{paymentStats.failedPayments}</strong>
            </div>
          </div>
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
            <WeatherUpdates />
          </div>
        </div>
      </div>

      {/* Modal for ticket details */}
      {ticketModalType && (
        <TicketDetailsModal
          type={ticketModalType}
          onClose={() => setTicketModalType(null)}
        />
      )}

      {/* Modal for flight details */}
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