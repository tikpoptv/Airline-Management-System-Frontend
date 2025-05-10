import { useNavigate } from 'react-router-dom';
import { useMaintenance } from './context/MaintenanceContext';
import { useState, useRef, useEffect } from 'react';
import './MaintenancePage.css';

function MaintenancePage() {
  const navigate = useNavigate();
  const { logs } = useMaintenance();

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortKey, setSortKey] = useState<null | 'status' | 'date' | 'model'>(null);

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

  const handleRowClick = (logId: number) => {
    navigate(`/maintenance/${logId}`);
  };

  const handleAddNew = () => {
    navigate('/maintenance/maintenance/create');
  };

  const handleSort = (key: 'status' | 'date' | 'model') => {
    setSortKey(key);
    setIsSortOpen(false);
  };

  const sortedLogs = [...logs].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = a[sortKey].toLowerCase?.() || '';
    const valB = b[sortKey].toLowerCase?.() || '';
    return valA.localeCompare(valB);
  });

  return (
    <div className="maintenance-page">
      <h2>Maintenance</h2>

      <div className="maintenance-header">
        <input type="text" placeholder="Search" className="search-input" />
        <div className="maintenance-buttons">
          <button className="btn add-btn" onClick={handleAddNew}>+ Add new</button>
          <div className="sort-wrapper" ref={sortRef}>
            <button className="btn sort-btn" onClick={() => setIsSortOpen(!isSortOpen)}>Sort by ▾</button>
            {isSortOpen && (
              <div className="sort-dropdown">
                <div onClick={() => handleSort('status')}>Status</div>
                <div onClick={() => handleSort('date')}>Date</div>
                <div onClick={() => handleSort('model')}>Model</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="maintenance-table">
        <table>
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
            {sortedLogs.map((item) => (
              <tr key={item.id} onClick={() => handleRowClick(Number(item.id))} style={{ cursor: 'pointer' }}>
                <td>
                  <span className={getStatusColorClass(item.status)}>
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
}

function getStatusColorClass(status: string): string {
  const normalized = status.toLowerCase().trim().replace(/\s+/g, ' ');
  switch (normalized) {
    case 'completed':
      return 'status-badge green';
    case 'cancelled':
    case 'canceled':
      return 'status-badge red';
    case 'pending':
      return 'status-badge orange';
    case 'in progress':
      return 'status-badge yellow';
    default:
      return 'status-badge';
  }
}

export default MaintenancePage;
