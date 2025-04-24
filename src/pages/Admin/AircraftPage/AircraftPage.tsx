import './AircraftPage.css';
import { FaPlane, FaEye, FaRegBuilding } from "react-icons/fa";
import SearchBar from "../../../components/SearchBar";
import { useEffect, useState } from "react";

interface Aircraft {
  AircraftId: string;
  ModelName: string;
  Owner: string;
}

const AircraftPage = () => {
  const [aircraftList, setAircraftList] = useState<Aircraft[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);

  // Load aircraft data from public/aircraft.json
  useEffect(() => {
    fetch('src/mock/Aircraft.json')
      .then(res => res.json())
      .then(data => setAircraftList(data))
      .catch(err => console.error("Failed to load aircraft data:", err));
  }, []);

  return (
    <div className="aircraft-page">
      {!selectedAircraft ? (
        <div>
          <div className="aircraft-header">
            <div className="title-group">
              <h4>Aircraft</h4>
              <h2 className="title">Aircraft Management</h2>
            </div>
            <div className="header-actions">
              <SearchBar />
              <div className="button-group">
                {isEditing && (
                  <>
                    <button className="add-button">Add New</button>
                    <button className="delete-button" >Delete</button>
                  </>
                )}
                <button
                  className={`edit-button ${isEditing ? "done-button" : ""}`}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Done" : "Edit"}
                </button>
              </div>
            </div>
          </div>
          <table className="aircraft-table">
            <thead>
              <tr>
                {isEditing && <th></th>}
                <th>Aircraft ID</th>
                <th>Model</th>
                <th>Owner</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {aircraftList.map((air, index) => (
                <tr key={index}>
                  {isEditing && (
                    <td>
                      <input type="checkbox" />
                    </td>
                  )}
                  <td>{air.AircraftId}</td>
                  <td><FaPlane className="plane-icon" /> {air.ModelName}</td>
                  <td>{air.Owner}</td>
                  <td>
                    <FaEye
                      className="detail-icon"
                      aria-label="View details"
                      onClick={() => setSelectedAircraft(air)}
                      style={{ cursor: "pointer" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Detail View
        <div className="aircraft-detail">
          <button className="close-button" onClick={() => setSelectedAircraft(null)}>
            ← Back
          </button>

          <h3 style={{ fontSize: "25px" }}>Aircraft Profile</h3>
          <div className="profile-card">
            <div className="profile-avatar">
              <FaRegBuilding />
            </div>
            <div className="profile-fields">
              <div><strong>Model:</strong> {selectedAircraft.ModelName}</div>
              <div><strong>Aircraft ID:</strong> {selectedAircraft.AircraftId}</div>
              <div><strong>Owner:</strong> {selectedAircraft.Owner}</div>
              <div><strong>Last Inspection:</strong> 01/01/2024</div>
              <div><strong>Next Inspection:</strong> 01/01/2025</div>
            </div>
          </div>

          <h4 style={{ fontSize: "25px" }}>Flight Schedule</h4>
          <table className="schedule-table">
            <thead>
              <tr className="task-row">
                <td colSpan={5}>
                  <h3><strong>Task</strong></h3>
                </td>
              </tr>
            </thead>
            <thead>
              <tr>
                <th>Status</th>
                <th>Date</th>
                <th>Flight ID</th>
                <th>Depart</th>
                <th>Land</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ color: "green" }}>Scheduled</td>
                <td>12/12/2025</td>
                <td>FD2007</td>
                <td>BKK</td>
                <td>HKT</td>
              </tr>
              <tr>
                <td>Completed</td>
                <td>12/11/2025</td>
                <td>FD2017</td>
                <td>BKK</td>
                <td>CNX</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AircraftPage;