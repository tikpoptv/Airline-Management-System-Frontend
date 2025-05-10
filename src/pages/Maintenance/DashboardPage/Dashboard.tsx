import React from 'react';
import './Dashboard.css'; 

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="title-group">
          <h4>dashboard</h4>
          <h2 className="title">Hi, Maintenance</h2>
        </div>

      <div className="task-and-list-container">
        <div className="task-box">
          <p>Today task</p>
          <div className="task-count">5</div>
        </div>

        <div className="aircraft-list">
          <p>List</p>
          <div className="aircraft-id">Aircraft ID</div>
          <div className="aircraft-id">Aircraft ID</div>
          <div className="aircraft-id">Aircraft ID</div>
        </div>
      </div>

      <div className="history-section">
        <div className="history-header">
          <h3>History</h3>
          <div className="history-actions">
            <input type="text" placeholder="Search" />
            <button>+ Add new</button>
            <button>Sort by</button>
          </div>
        </div>

        <table className="history-table">
          <thead>
            <tr>
              <th>Status</th><th>Log_ID</th><th>Aircraft_ID</th>
              <th>Model</th><th>Date</th><th>User_ID</th><th>User_name</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="status completed">Completed</td><td>1</td><td>123</td><td>A320</td><td>2024-10-28</td><td>1005</td><td>Somsak_m</td></tr>
            <tr><td className="status cancelled">Cancelled</td><td>1</td><td>123</td><td>A320</td><td>2024-10-28</td><td>1005</td><td>Somsak_m</td></tr>
            <tr><td className="status pending">Pending</td><td>1</td><td>123</td><td>A320</td><td>2024-10-28</td><td>1005</td><td>Somsak_m</td></tr>
            <tr><td className="status progress">In progress</td><td>1</td><td>123</td><td>A320</td><td>2024-10-28</td><td>1005</td><td>Somsak_m</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;