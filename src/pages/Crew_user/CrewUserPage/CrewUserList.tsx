import { FaEye, FaSearch } from 'react-icons/fa';
// import { FaUser } from 'react-icons/fa';
import Loading from '../../../components/Loading';
import { useState } from 'react';
import { CrewProfile } from '../../../types/crewuser';
import './CrewUserPage.css';

interface Props {
  crewList: CrewProfile[];
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  setSelectedCrew: (crew: CrewProfile) => void;
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

  const handleCheckboxChange = (id: number) => {
    setSelectedCrewIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleRowClick = (crew: CrewProfile) => {
    setSelectedCrew(crew);
  };

  const filteredCrew = crewList.filter((crew) =>
    crew.crew_id.toString().includes(filterCrewId.trim()) &&
    (filterName === '' || crew.name.toLowerCase().includes(filterName.toLowerCase())) &&
    (filterRole === '' || crew.role === filterRole)
  );

  const roleOptions = ['Pilot', 'Co-Pilot', 'Attendant', 'Technician'];

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
              <button className="add-button" onClick={() => window.location.href = '/admin/crew/create'}>
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
                  <td className="name-cell">
                    <div className="crew-name">{crew.name}</div>
                  </td>
                  <td>
                    <span className={`role-badge ${crew.role.toLowerCase()}`}>
                      {crew.role}
                    </span>
                  </td>
                  <td>{crew.user.email}</td>
                  <td>{crew.passport_number}</td>
                  <td>{crew.flight_hours}</td>
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