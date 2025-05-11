import { FaUser } from 'react-icons/fa6';
import styles from './CrewSchedule.module.css';

// Mock data
const schedules = [
  {
    id: 1,
    name: 'John Smith',
    role: 'Captain',
    flight: 'TH103',
    time: '10:30',
    status: 'upcoming'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    role: 'First Officer',
    flight: 'TH205',
    time: '11:45',
    status: 'upcoming'
  },
  {
    id: 3,
    name: 'Michael Brown',
    role: 'Flight Attendant',
    flight: 'TH103',
    time: '10:30',
    status: 'active'
  },
  {
    id: 4,
    name: 'Emily Davis',
    role: 'Flight Attendant',
    flight: 'TH189',
    time: '09:15',
    status: 'completed'
  }
];

const CrewSchedule = () => {
  return (
    <div className={styles.container}>
      {schedules.map((schedule) => (
        <div 
          key={schedule.id} 
          className={`${styles.scheduleItem} ${styles[schedule.status]}`}
        >
          <div className={styles.avatar}>
            <FaUser />
          </div>
          <div className={styles.info}>
            <div className={styles.nameRow}>
              <h4>{schedule.name}</h4>
              <span className={styles.time}>{schedule.time}</span>
            </div>
            <div className={styles.details}>
              <span className={styles.role}>{schedule.role}</span>
              <span className={styles.flight}>Flight {schedule.flight}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CrewSchedule; 