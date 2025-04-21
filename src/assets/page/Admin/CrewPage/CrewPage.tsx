import "./CrewPage.css";
import { FaUser, FaEye } from "react-icons/fa";
import SearchBar from "../../../components/SearchBar";
import { useState } from "react";

const CrewPage = () => {
  const employees = [
    { id: "01010101", name: "Johnson Smith", role: "Chief" },
    { id: "01010101", name: "Johnson Smith", role: "Chief" },
    { id: "01010101", name: "Johnson Smith", role: "Chief" },
    { id: "01010101", name: "Johnson Smith", role: "Chief" },
    { id: "01010101", name: "Johnson Smith", role: "Chief" },
  ];

  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="crew-page">
      <div className="crew-header">
        <div className="title-group">
          <h4>Crew</h4>
          <h2 className="title">Crew management</h2>
        </div>
        <div className="header-actions">
          <SearchBar />
          <div className="button-group">
            <button className="add-button">+ Add new</button>
            <button
              className="edit-button"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Done" : "Edit"}
            </button>
          </div>
        </div>
      </div>
      <table className="crew-table">
        <thead>
          <tr>
            {isEditing && <th></th>}
            <th>Employee ID</th>
            <th>Employee Name</th>
            <th>Role</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, index) => (
            <tr key={index}>
              {isEditing && (
                <td>
                  <input type="checkbox" />
                </td>
              )}
              <td>{emp.id}</td>
              <td>
                <FaUser className="user-icon" /> {emp.name}
              </td>
              <td>{emp.role}</td>
              <td>
                <FaEye className="detail-icon" aria-label="View details" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CrewPage;
