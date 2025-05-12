import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlane, FaCalendarAlt, FaTools } from 'react-icons/fa';
import { MaintenanceLogStatus, MaintenanceLog, MaintenanceAircraft } from '../../../types/maintenance';
import { getMyMaintenanceTasks } from '../../../services/maintenance/maintenanceService';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';

interface AssignedAircraft {
  id: string;
  model?: string;
  status: MaintenanceLogStatus;
  nextMaintenance?: string;
  aircraftDetail?: MaintenanceAircraft;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>('Maintenance');
  const [todayTasks, setTodayTasks] = useState(0);
  const [tasksSummary, setTasksSummary] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    total: 0
  });
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [filterLogId, setFilterLogId] = useState('');
  const [filterAircraftId, setFilterAircraftId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignedAircraft, setAssignedAircraft] = useState<AssignedAircraft[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    // Get username from localStorage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const logs = await getMyMaintenanceTasks();
        setMaintenanceLogs(logs);
        
        // Count today's tasks - using date components instead of string comparison
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentDay = now.getDate();
        
        console.log(`Current date components: ${currentYear}-${currentMonth+1}-${currentDay}`);
        
        const todayTasks = logs.filter(log => {
          // Convert log date to local date object
          const logDate = new Date(log.date_of_maintenance);
          
          // Compare year, month and day components
          const isSameYear = logDate.getFullYear() === currentYear;
          const isSameMonth = logDate.getMonth() === currentMonth;
          const isSameDay = logDate.getDate() === currentDay;
          const isToday = isSameYear && isSameMonth && isSameDay;
          
          // Check if status is active
          const isActiveStatus = log.status === 'Pending' || log.status === 'In Progress';
          
          console.log(`Log ${log.log_id}: ${logDate.getFullYear()}-${logDate.getMonth()+1}-${logDate.getDate()}, isToday=${isToday}, isActive=${isActiveStatus}`);
          
          return isToday && isActiveStatus;
        });
        
        console.log('Today tasks:', todayTasks);
        setTodayTasks(todayTasks.length);
        
        // Count tasks by status
        const summary = {
          pending: logs.filter(log => log.status === 'Pending').length,
          inProgress: logs.filter(log => log.status === 'In Progress').length,
          completed: logs.filter(log => log.status === 'Completed').length,
          cancelled: logs.filter(log => log.status === 'Cancelled').length,
          total: logs.length
        };
        setTasksSummary(summary);
        
        // Extract unique assigned aircraft with more details
        const uniqueAircraft = new Map<string, AssignedAircraft>();
        logs.forEach(log => {
          if (log.aircraft_id && log.aircraft) {
            uniqueAircraft.set(String(log.aircraft_id), {
              id: String(log.aircraft_id),
              model: log.aircraft.model,
              status: log.status,
              nextMaintenance: log.date_of_maintenance,
              aircraftDetail: log.aircraft
            });
          }
        });
        setAssignedAircraft(Array.from(uniqueAircraft.values()));
        
        setError(null);
      } catch (err) {
        setError('Failed to fetch your maintenance tasks');
        console.error('Error fetching maintenance tasks:', err);
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

  const applyFilters = () => {
    setIsFiltered(true);
    let results = [...maintenanceLogs];
    
    if (filterLogId) {
      results = results.filter(log => 
        String(log.log_id).includes(filterLogId)
      );
    }
    
    if (filterAircraftId) {
      results = results.filter(log => 
        String(log.aircraft_id).includes(filterAircraftId)
      );
    }
    
    if (filterStatus) {
      results = results.filter(log => 
        log.status === filterStatus
      );
    }
    
    setFilteredLogs(results);
    setShowSearchModal(false);
  };
  
  const clearFilters = () => {
    setFilterLogId('');
    setFilterAircraftId('');
    setFilterStatus('');
    setIsFiltered(false);
    setFilteredLogs([]);
    setShowSearchModal(false);
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.titleGroup}>
        <h4>dashboard</h4>
        <h2 className={styles.title}>Hi, {username}</h2>
      </div>

      <div className={styles.taskAndListContainer}>
        <div className={styles.taskBox}>
          <p>Today's Tasks</p>
          <div className={styles.taskCount}>{todayTasks}</div>
        </div>

        <div className={styles.taskSummary}>
          <h3>My Task Summary</h3>
          <div className={styles.summaryItems}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Pending</span>
              <span className={`${styles.summaryValue} ${styles.pendingValue}`}>{tasksSummary.pending}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>In Progress</span>
              <span className={`${styles.summaryValue} ${styles.inProgressValue}`}>{tasksSummary.inProgress}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Completed</span>
              <span className={`${styles.summaryValue} ${styles.completedValue}`}>{tasksSummary.completed}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Cancelled</span>
              <span className={`${styles.summaryValue} ${styles.cancelledValue}`}>{tasksSummary.cancelled}</span>
            </div>
            <div className={`${styles.summaryItem} ${styles.totalItem}`}>
              <span className={styles.summaryLabel}>Total</span>
              <span className={styles.summaryValue}>{tasksSummary.total}</span>
            </div>
          </div>
        </div>

        <div className={styles.aircraftList}>
          <p>Assigned Aircraft</p>
          {assignedAircraft.length > 0 ? (
            assignedAircraft.map((aircraft, index) => (
              <div 
                key={index} 
                className={styles.aircraftId}
                onClick={() => navigate(`/maintenance/log?aircraftId=${aircraft.id}`)}
              >
                <div className={styles.aircraftInfo}>
                  <span 
                    className={`${styles.aircraftStatus} ${styles[`aircraftStatus${aircraft.status.replace(/\s+/g, '')}`]}`}
                  >
                    {aircraft.status}
                  </span>
                  
                  <div className={styles.aircraftDetails}>
                    <div className={styles.aircraftHeader}>
                      <FaPlane className={styles.aircraftIcon} />
                      <span className={styles.aircraftIdText}>ID: {aircraft.id}</span>
                    </div>
                    
                    {aircraft.model && (
                      <div className={styles.aircraftModel}>
                        <span className={styles.modelText}>Model: {aircraft.model}</span>
                      </div>
                    )}
                    
                    {aircraft.nextMaintenance && (
                      <div className={styles.nextMaintenance}>
                        <FaCalendarAlt className={styles.maintenanceIcon} />
                        <span className={styles.maintenanceText}>
                          Next: {new Date(aircraft.nextMaintenance).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    {aircraft.aircraftDetail && (
                      <div className={styles.aircraftCapacity}>
                        <FaTools className={styles.capacityIcon} />
                        <span className={styles.capacityText}>
                          Year: {aircraft.aircraftDetail.manufacture_year}, 
                          Capacity: {aircraft.aircraftDetail.capacity}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noAircraftContainer}>
              <div className={styles.noAircraftMessage}>No aircraft assigned to you</div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.historySection}>
        <div className={styles.historyHeader}>
          <h3>
            {isFiltered ? (
              <>
                Search Results 
                <button 
                  className={styles.clearFiltersButton} 
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </>
            ) : (
              'My Maintenance Tasks'
            )}
          </h3>
          <div className={styles.historyActions}>
            <button
              className={styles.searchPopupButton}
              onClick={() => setShowSearchModal(true)}
              title="Advanced Search"
            >
              <FaSearch />
            </button>
            <button className={styles.addButton} onClick={() => navigate('/maintenance/log/create')}>+ Add new</button>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingMessage}>Loading your maintenance tasks...</div>
        ) : error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : (isFiltered && filteredLogs.length === 0) ? (
          <div className={styles.noDataMessage}>No results found for your search criteria</div>
        ) : (!isFiltered && maintenanceLogs.length === 0) ? (
          <div className={styles.noDataMessage}>You have no maintenance tasks assigned</div>
        ) : (
          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th>Status</th>
                <th>Log_ID</th>
                <th>Aircraft_ID</th>
                <th>Model</th>
                <th>Date</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {(isFiltered ? filteredLogs : maintenanceLogs).map((log) => (
                <tr 
                  key={log.log_id} 
                  onClick={() => navigate(`/maintenance/log/${log.log_id}`)}
                  className={styles.clickableRow}
                >
                  <td className={`${styles.status} ${styles[`status${log.status.replace(' ', '')}`]}`}>
                    {log.status}
                  </td>
                  <td>{log.log_id}</td>
                  <td>{log.aircraft_id}</td>
                  <td>{log.aircraft?.model || 'N/A'}</td>
                  <td>{formatDate(log.date_of_maintenance)}</td>
                  <td>{log.maintenance_location || 'N/A'}</td>
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

            <div className={styles.modalActions}>
              <button 
                className={styles.primaryButton} 
                onClick={applyFilters}
              >
                Apply Filter
              </button>
              <button
                className={styles.secondaryButton}
                onClick={clearFilters}
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