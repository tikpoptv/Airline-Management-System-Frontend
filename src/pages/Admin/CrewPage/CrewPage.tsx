import { FaUser, FaEye } from "react-icons/fa";
import SearchBar from "../../../components/SearchBar";
import { FaUserCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import "./CrewPage.css"

// Type definitions for Employee data
interface Employee {
  id: string;
  name: string;
  role: string;
  licenseExpireDate: string;
  passportExpireDate: string;
}

const CrewPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetch("src/mock/Crew.json")
      .then((res) => res.json())
      .then((data) => setEmployees(data))
      .catch((err) => console.error("Failed to load crew data:", err));
  }, []);

  return (
    <div className="crew-page">
      {!selectedEmployee ? (
        <div>
          <div className="crew-header">
            <div className="title-group">
              <h4>Crew</h4>
              <h2 className="title">Crew Management</h2>
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
                    <FaEye
                      className="detail-icon"
                      aria-label="View details"
                      onClick={() => setSelectedEmployee(emp)}
                      style={{ cursor: "pointer" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Employee Detail Page
        <div className="employee-detail">
          <button
            className="close-button"
            onClick={() => setSelectedEmployee(null)}
          >
            ← Back
          </button>

          <h3 style={{ fontSize: "25px" }}>Profile</h3>
          <div className="profile-card">
            <div className="profile-avatar">
              <FaUserCircle />
            </div>
            <div className="profile-fields">
              <div>
                <strong>Mr. {selectedEmployee.name.split(" ")[0]}</strong>
              </div>
              <div><strong>{selectedEmployee.name.split(" ")[1]}</strong></div>
              <div>Employee ID: {selectedEmployee.id}</div>
              <div>Role: {selectedEmployee.role}</div>
              <div>License Expire Date: {selectedEmployee.licenseExpireDate}</div>
              <div>Passport Expire Date: {selectedEmployee.passportExpireDate}</div>
            </div>
          </div>

          <h4 style={{ fontSize: "25px" }}>Schedule</h4>
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

export default CrewPage;