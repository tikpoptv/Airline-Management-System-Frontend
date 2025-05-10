import { useNavigate } from 'react-router-dom';
import { useMaintenance } from './context/MaintenanceContext';
import { useState, useRef, useEffect } from 'react';
import './NewMaintenancePage.css';

function MaintenancePage() {
  const navigate = useNavigate();
  const { logs } = useMaintenance();

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<null | 'id' | 'status' | 'date' | 'model'>(null);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

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

  const handleRowClick = (id: string) => {
    navigate(`/maintenance/${id}`);
  };

  const handleSort = (key: 'id' | 'status' | 'date' | 'model') => {
    setSortKey(key);
    setIsSortOpen(false);
  };

  const filteredLogs = logs
    .filter(log =>
      Object.values(log).some(value =>
        value.toLowerCase().includes(search.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (!sortKey) return 0;
      const valA = a[sortKey]?.toString().toLowerCase() || '';
      const valB = b[sortKey]?.toString().toLowerCase() || '';
      return valA.localeCompare(valB);
    });

  return (
    <div className="maintenance-container">
      <h2 className="page-title">Maintenance</h2>

      <div className="top-bar">
        <input
          type="text"
          className="search-box"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="button-group">
          <button className="btn" onClick={() => navigate('/maintenance/maintenance/create')}>
            + Add new
          </button>
          <div className="sort-wrapper" ref={sortRef}>
            <button className="btn sort-btn" onClick={() => setIsSortOpen(!isSortOpen)}>
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

      <div className="table-wrapper">
        <table className="maintenance-table">
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
            {filteredLogs.map((log) => (
              <tr key={log.id} onClick={() => handleRowClick(log.id)} className="table-row">
                <td>
                  <span className={`status ${log.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {log.status}
                  </span>
                </td>
                <td>{log.id}</td>
                <td>{log.aircraftId}</td>
                <td>{log.model}</td>
                <td>{log.date}</td>
                <td>{log.userId}</td>
                <td>{log.userName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MaintenancePage;