import {  FaEye, FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Loading from '../../../components/Loading';
import { useState } from 'react';
import { MaintenanceLog, MaintenanceLogStatus } from '../../../types/maintenance';
// import CreateMaintenanceModal from './CreateMaintenanceModal';
import { useNavigate } from 'react-router-dom';
import styles from './MaintenancePage.module.css';

interface Props {
  maintenanceList: MaintenanceLog[];
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  setSelectedMaintenanceLog: (log: MaintenanceLog) => void;
  loading: boolean;
  selectedLogIds: number[];
  setSelectedLogIds: React.Dispatch<React.SetStateAction<number[]>>;
  onDelete: () => void;
}

const getMaintenanceStatusClass = (status: MaintenanceLogStatus): string => {
  const statusMap: Record<MaintenanceLogStatus, string> = {
    'Pending': styles.statusPending,
    'In Progress': styles.statusInProgress,
    'Completed': styles.statusCompleted,
    'Cancelled': styles.statusCancelled
  };
  return statusMap[status] || '';
};

const getMaintenanceStatusLabel = (status: MaintenanceLogStatus): string => {
  const statusMap: Record<MaintenanceLogStatus, string> = {
    'Pending': '⏳ Pending',
    'In Progress': '🔧 In Progress',
    'Completed': '✈️ Completed',
    'Cancelled': '☢️ Cancelled'
  };
  return statusMap[status] || status;
};

const MaintenanceLogList = ({
  maintenanceList,
  isEditing,
  setIsEditing,
  setSelectedMaintenanceLog,
  loading,
  selectedLogIds,
  setSelectedLogIds,
  onDelete,
}: Props) => {
  const [showSearchModal, setShowSearchModal] = useState(false);
//   const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterLogId, setFilterLogId] = useState('');
  const [filterAircraftId, setFilterAircraftId] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStatus, setFilterStatus] = useState<MaintenanceLogStatus | ''>('');
  const [filterAssignedTo, setFilterAssignedTo] = useState('');
  const navigate = useNavigate();

  const handleCheckboxChange = (id: number) => {
    setSelectedLogIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRowClick = (log: MaintenanceLog) => {
    setSelectedMaintenanceLog(log);
  };

  const filteredLogs = maintenanceList.filter((log) =>
    log.log_id.toString().includes(filterLogId.trim()) &&
    log.aircraft_id.toString().includes(filterAircraftId.trim()) &&
    (filterLocation === '' || log.maintenance_location.includes(filterLocation)) &&
    (filterStatus === '' || log.status === filterStatus) &&
    (filterAssignedTo === '' || 
      (log.assigned_user && log.assigned_user.username.toLowerCase().includes(filterAssignedTo.toLowerCase())))
  );

  const locationOptions = [...new Set(maintenanceList.map((log) => log.maintenance_location))];
  const userOptions = [...new Set(maintenanceList
    .filter(log => log.assigned_user)
    .map((log) => log.assigned_user?.username || ''))];

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className={styles.maintenanceList}>
      <div className={styles.maintenanceHeader}>
        <div className={styles.titleGroup}>
          <h4>Maintenance</h4>
          <h2>Maintenance Log Management</h2>
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.searchPopupButton}
            onClick={() => setShowSearchModal(true)}
            title="Advanced Search"
          >
            <FaSearch />
          </button>

          <div className={styles.buttonGroup}>
            {isEditing && (
              <button className={styles.addButton} onClick={() => navigate('/maintenance/maintenance/create')}>
                <FaPlus /> Add New
              </button>
            )}
            {isEditing && selectedLogIds.length > 0 && (
              <button className={styles.deleteButton} onClick={onDelete}>
                <FaTrash /> Delete Selected
              </button>
            )}
            <button
              className={`${styles.editButton} ${isEditing ? styles.doneButton : ''}`}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Done' : <><FaEdit /> Edit</>}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading maintenance logs..." />
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.maintenanceTable}>
            <thead>
              <tr>
                {isEditing && <th className={styles.checkboxColumn} />}
                <th className={styles.statusColumn}>Status</th>
                <th>Log ID</th>
                <th>Aircraft_ID</th>
                <th>Model</th>
                <th>Date</th>
                <th>User_ID</th>
                <th>Assigned To</th>
                <th className={styles.actionsColumn} />
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log.log_id}
                  onClick={() => handleRowClick(log)}
                  className={`${styles.maintenanceRow} ${selectedLogIds.includes(log.log_id) ? styles.selected : ''}`}
                >
                  {isEditing && (
                    <td className={styles.checkboxColumn} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedLogIds.includes(log.log_id)}
                        onChange={() => handleCheckboxChange(log.log_id)}
                      />
                    </td>
                  )}
                  <td className={styles.statusColumn}>
                    <span className={`${styles.maintenanceStatus} ${getMaintenanceStatusClass(log.status)}`}>
                      {getMaintenanceStatusLabel(log.status)}
                    </span>
                  </td>
                  <td className={styles.idColumn}>{log.log_id}</td>
                  <td className={styles.aircraftColumn}>{log.aircraft_id}</td>
                  <td className={styles.modelColumn}>{log.aircraft?.model || 'N/A'}</td>
                  <td className={styles.dateColumn}>{formatDate(log.date_of_maintenance)}</td>
                  <td className={styles.userIdColumn}>{log.assigned_user?.user_id || 'N/A'}</td>
                  <td className={styles.assignedColumn}>
                    {log.assigned_user ? log.assigned_user.username : 'Unassigned'}
                  </td>
                  <td className={styles.actionsColumn} onClick={(e) => e.stopPropagation()}>
                    <button
                      className={styles.viewButton}
                      onClick={() => navigate(`/maintenance/maintenance/detail/${log.log_id}`)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Search Modal */}
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
              <label>Location</label>
              <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
                <option value="">All Locations</option>
                {locationOptions.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Status</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value as MaintenanceLogStatus | '')}
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>Assigned To</label>
              <select value={filterAssignedTo} onChange={(e) => setFilterAssignedTo(e.target.value)}>
                <option value="">All Users</option>
                {userOptions.map((username) => (
                  <option key={username} value={username}>{username}</option>
                ))}
              </select>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.confirmButton} onClick={() => setShowSearchModal(false)}>
                Apply Filter
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => {
                  setFilterLogId('');
                  setFilterAircraftId('');
                  setFilterLocation('');
                  setFilterStatus('');
                  setFilterAssignedTo('');
                  setShowSearchModal(false);
                }}
              >
                Clear & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Maintenance Log Modal */}
      {/* <CreateMaintenanceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          window.location.reload();
        }}
      /> */}
    </div>
  );
};

export default MaintenanceLogList;