import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { CrewProfile, CrewAssignment } from '../../../types/crewuser';
import { getCrewAssignments, getCrewProfile } from '../../../services/crewuser/crewuserService';
import styles from './UserDashboard.module.css';

interface Aircraft {
  id: string;
  status: string;
}



const Dashboard = () => {
  const [todayTasks, setTodayTasks] = useState(0);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crewProfile, setCrewProfile] = useState<CrewProfile | null>(null);
  const [crewAssignments, setCrewAssignments] = useState<CrewAssignment[]>([]);



  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const profile = await getCrewProfile();
        setCrewProfile(profile);
        const assignments = await getCrewAssignments();
        setCrewAssignments(assignments);
        const todayStr = new Date().toISOString().split('T')[0];
        const todayCount = assignments.filter(a => {
          const depDate = new Date(a.flight.departure_time).toISOString().split('T')[0];
          return depDate === todayStr;
        }).length;
        setTodayTasks(todayCount);
        setError(null);
      } catch (err) {
        setError('Failed to fetch crew profile or assignments');
        console.error('Error fetching crew profile or assignments:', err);
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

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.titleGroup}>
        <h4>dashboard</h4>
        <h2 className={styles.title}>Hi, Maintenance</h2>
      </div>

      <div className={styles.taskAndListContainer}>
        <div className={styles.taskBox}>
          <p>Today's Tasks</p>
          <div className={styles.taskCount}>{todayTasks}</div>
        </div>

        <div className={styles.aircraftList}>
          <p style={{fontWeight:600, fontSize:'1.2rem', marginBottom:'1rem'}}>Crew Schedule</p>
          <div className="table-wrapper">
            <table className="crew-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Flight</th>
                  <th>Date</th>
                  <th>Route</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {crewAssignments.length === 0 ? (
                  <tr><td colSpan={5} style={{textAlign:'center'}}>No assignments found</td></tr>
                ) : (
                  crewAssignments.map((assignment, idx) => {
                    const dep = new Date(assignment.flight.departure_time);
                    const arr = new Date(assignment.flight.arrival_time);
                    const dateStr = dep.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                    const depTime = dep.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                    const arrTime = arr.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                    return (
                      <tr key={idx}>
                        <td><span className="role-badge attendant">{assignment.flight.flight_status.toUpperCase()}</span></td>
                        <td style={{fontWeight:600}}>{assignment.flight.flight_number}</td>
                        <td>{dateStr}</td>
                        <td>{assignment.flight.route.from_airport.iata_code} &rarr; {assignment.flight.route.to_airport.iata_code}</td>
                        <td>{depTime} &ndash; {arrTime}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={styles.historySection}>
        <div className={styles.historyHeader}>
          <h3>Crew Profile</h3>
          <div className={styles.historyActions}>
            <button
              className={styles.searchPopupButton}
              onClick={() => setShowSearchModal(true)}
              title="Advanced Search"
            >
              <FaSearch />
            </button>
            <button className={styles.addButton}>+ Add new</button>
          </div>
        </div>
        {loading ? (
          <div className={styles.loadingMessage}>Loading crew profile...</div>
        ) : error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : crewProfile ? (
          <div className="table-wrapper">
            <table className="crew-table">
              <thead>
                <tr>
                  <th>Crew ID</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Passport Number</th>
                  <th>Flight Hours</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{crewProfile.crew_id}</td>
                  <td>{crewProfile.name}</td>
                  <td>
                    <span className="role-badge attendant">{crewProfile.role}</span>
                  </td>
                  <td>{crewProfile.user.email}</td>
                  <td>{crewProfile.passport_number}</td>
                  <td>{crewProfile.flight_hours}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}
        {showSearchModal && (
          <div className="search-modal-backdrop">
            <div className="search-modal">
              <h3>Advanced Search</h3>
              <div className="input-group">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Enter Name"
                />
              </div>
              <div className="input-group">
                <label>Role</label>
                <select>
                  <option value="">All Roles</option>
                  <option value="Pilot">Pilot</option>
                  <option value="Co-Pilot">Co-Pilot</option>
                  <option value="Attendant">Attendant</option>
                  <option value="Technician">Technician</option>
                </select>
              </div>
              <div className="modal-actions">
                <button className="apply-button" onClick={() => setShowSearchModal(false)}>
                  Apply Filter
                </button>
                <button
                  className="clear-button"
                  onClick={() => {
                    setShowSearchModal(false);
                  }}
                >
                  Clear & Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;