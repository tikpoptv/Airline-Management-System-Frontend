import {  FaEye, FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Loading from '../../../components/Loading';
import { useState } from 'react';
import { MaintenanceLog, MaintenanceLogStatus } from '../../../types/maintenance';
// import CreateMaintenanceModal from './CreateMaintenanceModal';
import { useNavigate } from 'react-router-dom';

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
    'Pending': 'status-pending',
    'In Progress': 'status-in-progress',
    'Completed': 'status-completed',
    'Cancelled': 'status-cancelled'
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
    <div className="maintenance-list">
      <div className="maintenance-header">
        <div className="title-group">
          <h4>Maintenance</h4>
          <h2>Maintenance Log Management</h2>
        </div>

        <div className="header-actions">
          <button
            className="search-popup-button"
            onClick={() => setShowSearchModal(true)}
            title="Advanced Search"
          >
            <FaSearch />
          </button>

          <div className="button-group">
            {isEditing && (
              <button className="add-button" onClick={() => navigate('/maintenance/maintenance/create')}>
                <FaPlus /> Add New
              </button>
            )}
            {isEditing && selectedLogIds.length > 0 && (
              <button className="delete-button" onClick={onDelete}>
                <FaTrash /> Delete Selected
              </button>
            )}
            <button
              className={`edit-button ${isEditing ? 'done-button' : ''}`}
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
        <div className="table-container">
          <table className="maintenance-table">
            <thead>
              <tr>
                {isEditing && <th className="checkbox-column" />}
                <th className="status-column">Status</th>
                <th>Log ID</th>
                <th>Aircraft_ID</th>
                <th>Model</th>
                <th>Date</th>
                <th>User_ID</th>
                <th>Assigned To</th>
                <th className="actions-column" />
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr
                  key={log.log_id}
                  onClick={() => handleRowClick(log)}
                  className={`maintenance-row ${selectedLogIds.includes(log.log_id) ? 'selected' : ''}`}
                >
                  {isEditing && (
                    <td className="checkbox-column" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedLogIds.includes(log.log_id)}
                        onChange={() => handleCheckboxChange(log.log_id)}
                      />
                    </td>
                  )}
                  <td className="status-column">
                    <span className={`maintenance-status ${getMaintenanceStatusClass(log.status)}`}>
                      {getMaintenanceStatusLabel(log.status)}
                    </span>
                  </td>
                  <td className="id-column">{log.log_id}</td>
                  <td className="aircraft-column">{log.aircraft_id}</td>
                  <td className="model-column">{log.aircraft?.model || 'N/A'}</td>
                  <td className="date-column">{formatDate(log.date_of_maintenance)}</td>
                  <td className="user-id-column">{log.assigned_user?.user_id || 'N/A'}</td>
                  <td className="assigned-column">
                    {log.assigned_user ? log.assigned_user.username : 'Unassigned'}
                  </td>
                  <td className="actions-column" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="view-button"
                      onClick={() => setSelectedMaintenanceLog(log)}
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
        <div className="search-modal-backdrop">
          <div className="search-modal">
            <h3>Advanced Search</h3>

            <div className="input-group">
              <label>Log ID</label>
              <input
                type="text"
                value={filterLogId}
                onChange={(e) => setFilterLogId(e.target.value)}
                placeholder="Enter Log ID"
              />
            </div>

            <div className="input-group">
              <label>Aircraft ID</label>
              <input
                type="text"
                value={filterAircraftId}
                onChange={(e) => setFilterAircraftId(e.target.value)}
                placeholder="Enter Aircraft ID"
              />
            </div>

            <div className="input-group">
              <label>Location</label>
              <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}>
                <option value="">All Locations</option>
                {locationOptions.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
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

            <div className="input-group">
              <label>Assigned To</label>
              <select value={filterAssignedTo} onChange={(e) => setFilterAssignedTo(e.target.value)}>
                <option value="">All Users</option>
                {userOptions.map((username) => (
                  <option key={username} value={username}>{username}</option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button className="primary-button" onClick={() => setShowSearchModal(false)}>
                Apply Filter
              </button>
              <button
                className="secondary-button"
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