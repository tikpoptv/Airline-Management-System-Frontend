import { FaPlane, FaEye, FaSearch } from 'react-icons/fa';
import Loading from '../../../components/Loading';
import { useState } from 'react';
import { Aircraft } from '../../../types/aircraft';

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
  const [filterAircraftId, setFilterAircraftId] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterOwner, setFilterOwner] = useState('');

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
    (filterOwner === '' || air.airline_owner === filterOwner)
  );

  const modelOptions = [...new Set(aircraftList.map((a) => a.model))];
  const ownerOptions = [...new Set(aircraftList.map((a) => a.airline_owner))];

  return (
    <>
      <div className="aircraft-header">
        <div className="title-group">
          <h4>Aircraft</h4>
          <h2 className="title">Aircraft Management</h2>
        </div>

        <div className="header-actions">
          <button
            className="search-popup-button"
            onClick={() => setShowSearchModal(true)}
            title="Advanced Search"
          >
            <FaSearch className="search-icon" />
          </button>

          <div className={`button-group`}>
            {isEditing && (
              <button className="add-button">Add New</button>
            )}
            {isEditing && (
              <button className="delete-button" onClick={onDelete}>
                Delete
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
        <Loading message="Loading plane..." />
      ) : (
        <table className="aircraft-table">
          <thead>
            <tr>
              {isEditing && <th />}
              <th>Aircraft ID</th>
              <th>Model</th>
              <th>Owner</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filteredAircrafts.map((air) => (
              <tr
                key={air.aircraft_id}
                onClick={() => handleRowClick(air)}
                className="aircraft-row"
              >
                {isEditing && (
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedAircraftIds.includes(air.aircraft_id)}
                      onChange={() => handleCheckboxChange(air.aircraft_id)}
                    />
                  </td>
                )}
                <td>{air.aircraft_id}</td>
                <td>
                  <FaPlane className="plane-icon" /> {air.model}
                </td>
                <td>{air.airline_owner}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  <FaEye
                    className="detail-icon"
                    onClick={() => setSelectedAircraft(air)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="search-modal-backdrop">
          <div className="search-modal">
            <h3 style={{ marginBottom: '1rem' }}>Advanced Search</h3>

            <div className="input-group">
              <label>Aircraft ID</label>
              <input
                type="text"
                value={filterAircraftId}
                onChange={(e) => setFilterAircraftId(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Model</label>
              <select value={filterModel} onChange={(e) => setFilterModel(e.target.value)}>
                <option value="">-- All Models --</option>
                {modelOptions.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Airline Owner</label>
              <select value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)}>
                <option value="">-- All Owners --</option>
                {ownerOptions.map((owner) => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
            </div>

            <div className="button-group" style={{ marginTop: '1rem' }}>
              <button onClick={() => setShowSearchModal(false)}>Apply Filter</button>
              <button
                onClick={() => {
                  setFilterAircraftId('');
                  setFilterModel('');
                  setFilterOwner('');
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AircraftList;
