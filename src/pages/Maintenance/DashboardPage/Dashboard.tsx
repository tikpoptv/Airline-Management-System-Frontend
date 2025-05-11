import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { MaintenanceLogStatus, MaintenanceLog } from '../../../types/maintenance';
import { getMaintenanceLogs } from '../../../services/maintenance/maintenanceService';
import styles from './Dashboard.module.css';

interface Aircraft {
  id: string;
  status: MaintenanceLogStatus;
}

const Dashboard = () => {
  const [todayTasks, setTodayTasks] = useState(0);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [filterLogId, setFilterLogId] = useState('');
  const [filterAircraftId, setFilterAircraftId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterUserId, setFilterUserId] = useState('');
  const [filterUserName, setFilterUserName] = useState('');
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [aircraftList] = useState<Aircraft[]>([
    { id: 'A320-001', status: 'Completed' },
    { id: 'A320-002', status: 'In Progress' },
    { id: 'B737-001', status: 'Pending' },
    { id: 'B737-002', status: 'Completed' },
    { id: 'A350-001', status: 'Cancelled' },
    { id: 'B787-001', status: 'Completed' },
    { id: 'A330-001', status: 'In Progress' },
    { id: 'B777-001', status: 'Pending' },
    { id: 'A320-003', status: 'Completed' },
    { id: 'B737-003', status: 'In Progress' }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const logs = await getMaintenanceLogs();
        setMaintenanceLogs(logs);
        
        // Count today's tasks
        const today = new Date().toISOString().split('T')[0];
        const todayTasksCount = logs.filter(log => 
          log.date_of_maintenance.startsWith(today) && 
          log.status !== 'Completed' && 
          log.status !== 'Cancelled'
        ).length;
        setTodayTasks(todayTasksCount);
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch maintenance logs');
        console.error('Error fetching maintenance logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.titleGroup}>
        <h4>dashboard</h4>
        <h2 className={styles.title}>Hi, Maintenance</h2>
      </div>

      <div className={styles.taskAndListContainer}>
        <div className={styles.taskBox}>
          <p>Today's Tasks</p>
          <div className={styles.taskCount}>{todayTasks}</div>
        </div>

        <div className={styles.aircraftList}>
          <p>Aircraft List</p>
          {aircraftList.map((aircraft, index) => (
            <div key={index} className={styles.aircraftId}>
              <div className={styles.aircraftInfo}>
                <span 
                  className={`${styles.aircraftStatus} ${styles[`aircraftStatus${aircraft.status.replace(/\s+/g, '')}`]}`}
                >
                  {aircraft.status}
                </span>
                <span className={styles.aircraftIdText}>{aircraft.id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.historySection}>
        <div className={styles.historyHeader}>
          <h3>History</h3>
          <div className={styles.historyActions}>
            <button
              className={styles.searchPopupButton}
              onClick={() => setShowSearchModal(true)}
              title="Advanced Search"
            >
              <FaSearch />
            </button>
            <button className={styles.addButton}>+ Add new</button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingMessage}>Loading maintenance logs...</div>
        ) : error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : (
          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th>Status</th>
                <th>Log_ID</th>
                <th>Aircraft_ID</th>
                <th>Model</th>
                <th>Date</th>
                <th>User_ID</th>
                <th>User_name</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceLogs.map((log) => (
                <tr key={log.log_id}>
                  <td className={`${styles.status} ${styles[`status${log.status.replace(' ', '')}`]}`}>
                    {log.status}
                  </td>
                  <td>{log.log_id}</td>
                  <td>{log.aircraft_id}</td>
                  <td>{log.aircraft?.model || 'N/A'}</td>
                  <td>{formatDate(log.date_of_maintenance)}</td>
                  <td>{log.assigned_user?.user_id || 'N/A'}</td>
                  <td>{log.assigned_user?.username || 'Unassigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showSearchModal && (
        <div className={styles.searchModalBackdrop}>
          <div className={styles.searchModal}>
            <h3>Advanced Search</h3>

            <div className={styles.inputGroup}>
              <label>Log ID</label>
              <input
                type="text"
                value={filterLogId}
                onChange={(e) => setFilterLogId(e.target.value)}
                placeholder="Enter Log ID"
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Aircraft ID</label>
              <input
                type="text"
                value={filterAircraftId}
                onChange={(e) => setFilterAircraftId(e.target.value)}
                placeholder="Enter Aircraft ID"
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Date</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>User ID</label>
              <input
                type="text"
                value={filterUserId}
                onChange={(e) => setFilterUserId(e.target.value)}
                placeholder="Enter User ID"
              />
            </div>

            <div className={styles.inputGroup}>
              <label>User Name</label>
              <input
                type="text"
                value={filterUserName}
                onChange={(e) => setFilterUserName(e.target.value)}
                placeholder="Enter User Name"
              />
            </div>

            <div className={styles.modalActions}>
              <button className={styles.primaryButton} onClick={() => setShowSearchModal(false)}>
                Apply Filter
              </button>
              <button
                className={styles.secondaryButton}
                onClick={() => {
                  setFilterLogId('');
                  setFilterAircraftId('');
                  setFilterStatus('');
                  setFilterDate('');
                  setFilterUserId('');
                  setFilterUserName('');
                  setShowSearchModal(false);
                }}
              >
                Clear & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;