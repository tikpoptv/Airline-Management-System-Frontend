import { FaPlane, FaEye, FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Loading from '../../../components/Loading';
import { useState } from 'react';
import { Aircraft, MaintenanceStatus } from '../../../types/aircraft';
import CreateAircraftModal from './CreateAircraftModal';
import { useNavigate } from 'react-router-dom';

interface Props {
  aircraftList: Aircraft[];
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  setSelectedAircraft: (aircraft: Aircraft) => void;
  loading: boolean;
  selectedAircraftIds: number[];
  setSelectedAircraftIds: React.Dispatch<React.SetStateAction<number[]>>;
  onDelete: () => void;
}

const getMaintenanceStatusClass = (status: MaintenanceStatus): string => {
  const statusMap: Record<MaintenanceStatus, string> = {
    'Operational': 'status-operational',
    'In Maintenance': 'status-in-maintenance',
    'Retired': 'status-retired'
  };
  return statusMap[status] || '';
};

const getMaintenanceStatusLabel = (status: MaintenanceStatus): string => {
  const statusMap: Record<MaintenanceStatus, string> = {
    'Operational': '✈️ Operational',
    'In Maintenance': '🔧 In Maintenance',
    'Retired': '⚠️ Retired'
  };
  return statusMap[status] || status;
};

const AircraftList = ({
  aircraftList,
  isEditing,
  setIsEditing,
  setSelectedAircraft,
  loading,
  selectedAircraftIds,
  setSelectedAircraftIds,
  onDelete,
}: Props) => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterAircraftId, setFilterAircraftId] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterOwner, setFilterOwner] = useState('');
  const [filterMaintenanceStatus, setFilterMaintenanceStatus] = useState<string>('');
  const navigate = useNavigate();

  const handleCheckboxChange = (id: number) => {
    setSelectedAircraftIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRowClick = (air: Aircraft) => {
    setSelectedAircraft(air);
  };

  const filteredAircrafts = aircraftList.filter((air) =>
    air.aircraft_id.toString().includes(filterAircraftId.trim()) &&
    (filterModel === '' || air.model === filterModel) &&
    (filterOwner === '' || air.airline_owner === filterOwner) &&
    (filterMaintenanceStatus === '' || air.maintenance_status === filterMaintenanceStatus)
  );

  const modelOptions = [...new Set(aircraftList.map((a) => a.model))];
  const ownerOptions = [...new Set(aircraftList.map((a) => a.airline_owner))];

  return (
    <div className="aircraft-list">
      <div className="aircraft-header">
        <div className="title-group">
          <h4>Aircraft</h4>
          <h2>Aircraft Management</h2>
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
              <button className="add-button" onClick={() => navigate('/admin/aircraft/create')}>
                <FaPlus /> Add New
              </button>
            )}
            {isEditing && selectedAircraftIds.length > 0 && (
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
        <Loading message="Loading aircrafts..." />
      ) : (
        <div className="table-container">
          <table className="aircraft-table">
            <thead>
              <tr>
                {isEditing && <th className="checkbox-column" />}
                <th>Aircraft ID</th>
                <th>Model</th>
                <th>Owner</th>
                <th className="maintenance-column">Status</th>
                <th className="actions-column" />
              </tr>
            </thead>
            <tbody>
              {filteredAircrafts.map((air) => (
                <tr
                  key={air.aircraft_id}
                  onClick={() => handleRowClick(air)}
                  className={`aircraft-row ${selectedAircraftIds.includes(air.aircraft_id) ? 'selected' : ''}`}
                >
                  {isEditing && (
                    <td className="checkbox-column" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedAircraftIds.includes(air.aircraft_id)}
                        onChange={() => handleCheckboxChange(air.aircraft_id)}
                      />
                    </td>
                  )}
                  <td className="id-column">{air.aircraft_id}</td>
                  <td className="model-column">
                    <FaPlane className="plane-icon" /> {air.model}
                  </td>
                  <td className="owner-column">{air.airline_owner}</td>
                  <td className="maintenance-column">
                    <span className={`maintenance-status ${getMaintenanceStatusClass(air.maintenance_status)}`}>
                      {getMaintenanceStatusLabel(air.maintenance_status)}
                    </span>
                  </td>
                  <td className="actions-column" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="view-button"
                      onClick={() => setSelectedAircraft(air)}
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
              <label>Aircraft ID</label>
              <input
                type="text"
                value={filterAircraftId}
                onChange={(e) => setFilterAircraftId(e.target.value)}
                placeholder="Enter Aircraft ID"
              />
            </div>

            <div className="input-group">
              <label>Model</label>
              <select value={filterModel} onChange={(e) => setFilterModel(e.target.value)}>
                <option value="">All Models</option>
                {modelOptions.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Airline Owner</label>
              <select value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)}>
                <option value="">All Airlines</option>
                {ownerOptions.map((owner) => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Maintenance Status</label>
              <select 
                value={filterMaintenanceStatus} 
                onChange={(e) => setFilterMaintenanceStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Operational">Operational</option>
                <option value="In Maintenance">In Maintenance</option>
                <option value="Retired">Retired</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="primary-button" onClick={() => setShowSearchModal(false)}>
                Apply Filter
              </button>
              <button
                className="secondary-button"
                onClick={() => {
                  setFilterAircraftId('');
                  setFilterModel('');
                  setFilterOwner('');
                  setFilterMaintenanceStatus('');
                  setShowSearchModal(false);
                }}
              >
                Clear & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Aircraft Modal */}
      <CreateAircraftModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          window.location.reload();
        }}
      />
    </div>
  );
};

export default AircraftList;