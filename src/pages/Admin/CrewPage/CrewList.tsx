import { FaEye, FaSearch } from 'react-icons/fa';
// import { FaUser } from 'react-icons/fa';
import Loading from '../../../components/Loading';
import { useState } from 'react';
import { Crew } from '../../../types/crew';
import './CrewPage.css';

interface Props {
  crewList: Crew[];
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  setSelectedCrew: (crew: Crew) => void;
  loading: boolean;
  selectedCrewIds: number[];
  setSelectedCrewIds: React.Dispatch<React.SetStateAction<number[]>>;
  onDelete: () => void;
}

const CrewList = ({
  crewList,
  isEditing,
  setIsEditing,
  setSelectedCrew,
  loading,
  selectedCrewIds,
  setSelectedCrewIds,
  onDelete,
}: Props) => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [filterCrewId, setFilterCrewId] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const handleCheckboxChange = (id: number) => {
    setSelectedCrewIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRowClick = (crew: Crew) => {
    setSelectedCrew(crew);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'on_leave':
        return 'status-on-leave';
      case 'training':
        return 'status-training';
      default:
        return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'on_leave':
        return 'On Leave';
      case 'training':
        return 'Training';
      default:
        return status;
    }
  };

  const filteredCrew = crewList.filter((crew) =>
    crew.crew_id.toString().includes(filterCrewId.trim()) &&
    (filterName === '' || crew.name.toLowerCase().includes(filterName.toLowerCase())) &&
    (filterRole === '' || crew.role === filterRole) &&
    (filterStatus === '' || crew.status === filterStatus)
  );

  const roleOptions = [...new Set(crewList.map((c) => c.role))];
  const statusOptions = ['active', 'inactive', 'on_leave', 'training'];

  return (
    <>
      <div className="crew-header">
        <div className="title-group">
          <h4>Crew</h4>
          <h2 className="title">Crew Management</h2>
        </div>

        <div className="header-actions">
          <button
            className="search-popup-button"
            onClick={() => setShowSearchModal(true)}
            title="Advanced Search"
          >
            <FaSearch className="search-icon" />
          </button>

          <div className="button-group">
            {isEditing && (
              <button className="add-button" onClick={() => window.location.href = '/admin/crew/new'}>
                Add New
              </button>
            )}
            {isEditing && selectedCrewIds.length > 0 && (
              <button className="delete-button" onClick={onDelete}>
                Delete Selected ({selectedCrewIds.length})
              </button>
            )}
            <button
              className={`edit-button ${isEditing ? 'done-button' : ''}`}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Done' : 'Edit'}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading crew..." />
      ) : (
        <div className="table-wrapper">
          <table className="crew-table">
            <thead>
              <tr>
                {isEditing && <th className="checkbox-column" />}
                <th>Crew ID</th>
                <th>Status</th>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Passport Number</th>
                <th>Flight Hours</th>
                <th className="action-column" />
              </tr>
            </thead>
            <tbody>
              {filteredCrew.map((crew) => (
                <tr
                  key={crew.crew_id}
                  onClick={() => handleRowClick(crew)}
                  className="crew-row"
                >
                  {isEditing && (
                    <td className="checkbox-column" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedCrewIds.includes(crew.crew_id)}
                        onChange={() => handleCheckboxChange(crew.crew_id)}
                      />
                    </td>
                  )}
                  <td className="crew-id">{crew.crew_id}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(crew.status)}`}>
                      {getStatusText(crew.status)}
                    </span>
                  </td>
                  <td className="name-cell">
                    <div className="crew-name">{crew.name}</div>
                  </td>
                  <td>
                    <span className={`role-badge ${crew.role.toLowerCase()}`}>
                      {crew.role}
                    </span>
                  </td>
                  <td className="email-cell">{crew.user.email}</td>
                  <td className="passport-cell">{crew.passport_number}</td>
                  <td className="flight-hours">{crew.flight_hours.toFixed(1)}</td>
                  <td className="action-column" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="view-button"
                      onClick={() => setSelectedCrew(crew)}
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
              <label>Crew ID</label>
              <input
                type="text"
                value={filterCrewId}
                onChange={(e) => setFilterCrewId(e.target.value)}
                placeholder="Enter Crew ID"
              />
            </div>

            <div className="input-group">
              <label>Name</label>
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Enter name"
              />
            </div>

            <div className="input-group">
              <label>Role</label>
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                <option value="">All Roles</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All Status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {getStatusText(status)}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button className="apply-button" onClick={() => setShowSearchModal(false)}>
                Apply Filter
              </button>
              <button
                className="clear-button"
                onClick={() => {
                  setFilterCrewId('');
                  setFilterName('');
                  setFilterRole('');
                  setFilterStatus('');
                }}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CrewList;