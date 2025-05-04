import React, { useState } from 'react';
import { FaMapMarkerAlt, FaExchangeAlt, FaFilter, FaSort, FaPlus } from 'react-icons/fa';
import './RoutePage.css';

// mock data
const mockRoutes = [
  { status: 'Active', id: '123456', from: 'Bangkok, BKK', to: 'Tokyo, NRT', duration: '23:59:59' },
  { status: 'Inactive', id: '123456', from: 'Bangkok, BKK', to: 'Tokyo, NRT', duration: '23:59:59' },
  { status: 'Active', id: '123456', from: 'Bangkok, BKK', to: 'Tokyo, NRT', duration: '23:59:59' },
  { status: 'Inactive', id: '123456', from: 'Bangkok, BKK', to: 'Tokyo, NRT', duration: '23:59:59' },
  { status: 'Active', id: '123456', from: 'Bangkok, BKK', to: 'Tokyo, NRT', duration: '23:59:59' },
  { status: 'Inactive', id: '123456', from: 'Bangkok, BKK', to: 'Tokyo, NRT', duration: '23:59:59' },
  { status: 'Active', id: '123456', from: 'Bangkok, BKK', to: 'Tokyo, NRT', duration: '23:59:59' },
];

const RoutePage: React.FC = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="routepage-outer">
      <div className="routepage-container">
        <div className="routepage-subtitle">Route</div>
        <h1 className="routepage-title">Route management</h1>
        <div className="routepage-card">
          <div className="routepage-searchbar">
            <div className="routepage-input-group">
              <input
                type="text"
                placeholder="From"
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="routepage-input"
              />
              <FaMapMarkerAlt style={{ marginLeft: 8, color: '#1976d2' }} />
            </div>
            <button onClick={handleSwap} className="routepage-swap-btn">
              <FaExchangeAlt style={{ color: '#1976d2' }} />
            </button>
            <div className="routepage-input-group">
              <input
                type="text"
                placeholder="To"
                value={to}
                onChange={e => setTo(e.target.value)}
                className="routepage-input"
              />
              <FaMapMarkerAlt style={{ marginLeft: 8, color: '#1976d2' }} />
            </div>
          </div>

          <div className="routepage-actionbar">
            <button className="routepage-action-btn">
              <FaSort /> Sort by
            </button>
            <button className="routepage-action-btn">
              <FaFilter /> Filter by
            </button>
            <button className="routepage-action-btn">
              <FaPlus /> Add New
            </button>
          </div>

          <div className="routepage-table-container">
            <table className="routepage-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Route ID</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Duration</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {mockRoutes.map((route, idx) => (
                  <tr key={idx}>
                    <td>
                      <span className={`routepage-status ${route.status.toLowerCase()}`}>{route.status}</span>
                    </td>
                    <td>{route.id}</td>
                    <td>{route.from}</td>
                    <td>{route.to}</td>
                    <td>{route.duration}</td>
                    <td>⋮</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePage; 