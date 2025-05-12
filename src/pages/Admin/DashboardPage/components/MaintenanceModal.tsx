import { useNavigate } from 'react-router-dom';
import styles from './MaintenanceModal.module.css';

interface MaintenanceLog {
  log_id: number;
  aircraft_id: number;
  date_of_maintenance: string;
  details: string;
  maintenance_location: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  assigned_to: number | null;
}

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  maintenanceLogs: MaintenanceLog[];
}

const MaintenanceModal = ({ isOpen, onClose, maintenanceLogs }: MaintenanceModalProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return styles.pending;
      case 'In Progress':
        return styles.inProgress;
      case 'Completed':
        return styles.completed;
      case 'Cancelled':
        return styles.cancelled;
      default:
        return '';
    }
  };

  const handleViewAll = () => {
    navigate('/admin/maintenance');
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Today's Maintenance Schedule</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Aircraft ID</th>
                <th>Location</th>
                <th>Details</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceLogs.map(log => (
                <tr key={log.log_id}>
                  <td>{formatDate(log.date_of_maintenance)}</td>
                  <td>{log.aircraft_id}</td>
                  <td>{log.maintenance_location}</td>
                  <td>{log.details}</td>
                  <td>
                    <span className={`${styles.status} ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
              {maintenanceLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className={styles.noData}>
                    No maintenance scheduled for today
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.viewAllButton} onClick={handleViewAll}>
            View All Maintenance
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceModal; 