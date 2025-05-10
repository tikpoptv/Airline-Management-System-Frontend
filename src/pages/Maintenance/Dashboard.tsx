import React, { useState, useEffect, useRef } from 'react';
import { useMaintenance } from './context/MaintenanceContext';
import './Dashboard.css';

const Dashboard = () => {
  const { logs } = useMaintenance();
  const [search, setSearch] = useState('');
  const [taskCount, setTaskCount] = useState(0);
  const [sortKey, setSortKey] = useState<null | 'id' | 'status' | 'date' | 'model'>(null);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTaskCount(logs.length);
  }, [logs]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSort = (key: 'id' | 'status' | 'date' | 'model') => {
    setSortKey(key);
    setIsSortOpen(false);
  };

  const filteredData = logs
    .filter(item =>
      Object.values(item).some(value =>
        value.toString().toLowerCase().includes(search.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (!sortKey) return 0;
      const valA = a[sortKey]?.toString().toLowerCase() || '';
      const valB = b[sortKey]?.toString().toLowerCase() || '';
      return valA.localeCompare(valB);
    });

  return (
    <div className="dashboard-container">
      <h2 className="username">Hi, Somsak_m</h2>

      <div className="top-section">
        <div className="task-box">
          <p>Today task</p>
          <div className="task-count">{taskCount}</div>
        </div>

        <div className="aircraft-list">
          <p>List</p>
          <div className="aircraft-id">Aircraft ID</div>
          <div className="aircraft-id">Aircraft ID</div>
          <div className="aircraft-id">Aircraft ID</div>
        </div>
      </div>

      <div className="history-header-section">
        <h3>History</h3>
        <div className="history-actions">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="sort-wrapper" ref={sortRef}>
            <button className="sort-btn" onClick={() => setIsSortOpen(!isSortOpen)}>
              Sort by ▾
            </button>
            {isSortOpen && (
              <div className="sort-dropdown">
                <div onClick={() => handleSort('id')}>Log_ID</div>
                <div onClick={() => handleSort('status')}>Status</div>
                <div onClick={() => handleSort('date')}>Date</div>
                <div onClick={() => handleSort('model')}>Model</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="history-section">
        <table className="history-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Log_ID</th>
              <th>Aircraft_ID</th>
              <th>Model</th>
              <th>Date</th>
              <th>User_ID</th>
              <th>User_name</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index}>
                <td>
                  <span className={`status ${item.status.toLowerCase().replace(' ', '-')}`}>
                    {item.status}
                  </span>
                </td>
                <td>{item.id}</td>
                <td>{item.aircraftId}</td>
                <td>{item.model}</td>
                <td>{item.date}</td>
                <td>{item.userId}</td>
                <td>{item.userName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;