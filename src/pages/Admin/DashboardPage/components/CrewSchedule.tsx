import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTodayCrewSchedules } from '../../../../services/crew/crewDashboardService';
import styles from './CrewSchedule.module.css';

interface CrewSchedule {
  crew_id: number;
  name: string;
  role: string;
  role_in_flight: string;
  flight_code: string;
  from_airport: string;
  to_airport: string;
  departure_time: string;
  arrival_time: string;
  status: string;
}

const CrewSchedule = () => {
  const [schedules, setSchedules] = useState<CrewSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const response = await getTodayCrewSchedules(5);
        setSchedules(response.schedules);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch crew schedules'));
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return styles.scheduled;
      case 'in_progress':
        return styles.inProgress;
      case 'completed':
        return styles.completed;
      case 'delayed':
        return styles.delayed;
      default:
        return '';
    }
  };

  const handleViewAll = () => {
    navigate('/admin/crew');
  };

  const handleCrewClick = (crewId: number) => {
    navigate(`/admin/crew/${crewId}`);
  };

  if (loading) return <div className={styles.loading}>Loading schedules...</div>;
  if (error) return <div className={styles.error}>Error: {error.message}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Today's Crew Schedule</h3>
        <button className={styles.viewAllButton} onClick={handleViewAll}>
          View All
        </button>
      </div>

      <div className={styles.scheduleList}>
        {schedules.length === 0 ? (
          <div className={styles.emptyState}>No schedules for today</div>
        ) : (
          schedules.map((schedule) => (
            <div
              key={`${schedule.crew_id}-${schedule.flight_code}`}
              className={`${styles.scheduleItem} ${getStatusClass(schedule.status)}`}
              onClick={() => handleCrewClick(schedule.crew_id)}
            >
              <div className={styles.avatar}>
                {schedule.name.charAt(0)}
              </div>
              <div className={styles.info}>
                <div className={styles.nameRow}>
                  <h4>{schedule.name}</h4>
                  <span className={styles.time}>
                    {formatTime(schedule.departure_time)}
                  </span>
                </div>
                <div className={styles.details}>
                  <span className={styles.role}>{schedule.role_in_flight}</span>
                  <span className={styles.flight}>
                    {schedule.flight_code} • {schedule.from_airport} → {schedule.to_airport}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CrewSchedule; 