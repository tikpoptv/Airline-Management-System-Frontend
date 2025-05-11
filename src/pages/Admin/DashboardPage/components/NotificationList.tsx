import { FaPlane, FaWrench, FaCloud } from 'react-icons/fa6';
import styles from './NotificationList.module.css';

interface Notification {
  id: number;
  type: 'delay' | 'maintenance' | 'weather';
  message: string;
  time: string;
}

interface NotificationListProps {
  notifications: Notification[];
}

const NotificationList = ({ notifications }: NotificationListProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'delay':
        return <FaPlane className={`${styles.icon} ${styles.delay}`} />;
      case 'maintenance':
        return <FaWrench className={`${styles.icon} ${styles.maintenance}`} />;
      case 'weather':
        return <FaCloud className={`${styles.icon} ${styles.weather}`} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      {notifications.map(notification => (
        <div key={notification.id} className={styles.item}>
          {getIcon(notification.type)}
          <div className={styles.content}>
            <p className={styles.message}>{notification.message}</p>
            <span className={styles.time}>{notification.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationList; 