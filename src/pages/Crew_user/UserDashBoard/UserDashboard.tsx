import React, { useState, useEffect } from 'react';
import { CrewProfile, CrewAssignment } from '../../../types/crewuser';
import { getCrewAssignments, getCrewProfile } from '../../../services/crewuser/crewuserService';
import styles from './UserDashboard.module.css';

const Dashboard = () => {
  const [todayTasks, setTodayTasks] = useState(0);
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

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.titleGroup}>
        <h4>DASHBOARD</h4>
        <h2 className={styles.title}>
          {crewProfile ? `Hi, ${crewProfile.name.toUpperCase()}` : 'Hi, CREW'}
        </h2>
      </div>

      <div className={styles.taskAndListContainer}>
        <div className={styles.taskBox}>
          <p>Today's Tasks</p>
          <div className={styles.taskCount}>{todayTasks}</div>
        </div>

        <div className={styles.aircraftList}>
          <p>Crew Schedule</p>
          <div className={styles.tableWrapper}>
            <table className={styles.crewTable}>
              <thead>
                <tr>
                  <th>STATUS</th>
                  <th>FLIGHT</th>
                  <th>DATE</th>
                  <th>ROUTE</th>
                  <th>TIME</th>
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
                        <td>
                          <span className={`${styles.roleBadge} ${styles[assignment.flight.flight_status.toLowerCase()]}`}>
                            {assignment.flight.flight_status.toUpperCase()}
                          </span>
                        </td>
                        <td>{assignment.flight.flight_number}</td>
                        <td>{dateStr}</td>
                        <td>{assignment.flight.route.from_airport.iata_code} → {assignment.flight.route.to_airport.iata_code}</td>
                        <td>{depTime} – {arrTime}</td>
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
        </div>
        {loading ? (
          <div className={styles.loadingMessage}>Loading crew profile...</div>
        ) : error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : crewProfile ? (
          <div className={styles.tableWrapper}>
            <table className={styles.crewTable}>
              <thead>
                <tr>
                  <th>CREW ID</th>
                  <th>NAME</th>
                  <th>ROLE</th>
                  <th>EMAIL</th>
                  <th>PASSPORT NUMBER</th>
                  <th>FLIGHT HOURS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{crewProfile.crew_id}</td>
                  <td>{crewProfile.name}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${styles[crewProfile.role.toLowerCase().replace('-', '')]}`}>
                      {crewProfile.role}
                    </span>
                  </td>
                  <td>{crewProfile.user.email}</td>
                  <td>{crewProfile.passport_number}</td>
                  <td>{crewProfile.flight_hours}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Dashboard;