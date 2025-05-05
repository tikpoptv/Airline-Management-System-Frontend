import React, { useState } from 'react';
import { FaMapMarkerAlt, FaExchangeAlt, FaFilter, FaSort, FaPlus, FaSearch } from 'react-icons/fa';
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
  const [routeId, setRouteId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSearch = () => {
    // mockup: ใส่ logic ค้นหาตามต้องการ
    console.log('ค้นหา', { routeId, from, to });
  };

  return (
    <div className="routepage-outer">
      <div className="routepage-container">
        <div className="routepage-subtitle">Route</div>
        <h1 className="routepage-title">Route management</h1>
        <div className="routepage-card">
          <div className="routepage-searchbar">
            <div className="routepage-input-group">
              <FaMapMarkerAlt className="routepage-icon" />
              <input
                type="text"
                placeholder="Route ID"
                value={routeId}
                onChange={e => setRouteId(e.target.value)}
                className="routepage-input routepage-input-bordered"
              />
            </div>
            <div className="routepage-input-group">
              <FaMapMarkerAlt className="routepage-icon" />
              <input
                type="text"
                placeholder="From"
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="routepage-input routepage-input-bordered"
              />
            </div>
            <button onClick={handleSwap} className="routepage-swap-btn" aria-label="Swap">
              <FaExchangeAlt className="routepage-icon" />
            </button>
            <div className="routepage-input-group">
              <FaMapMarkerAlt className="routepage-icon" />
              <input
                type="text"
                placeholder="To"
                value={to}
                onChange={e => setTo(e.target.value)}
                className="routepage-input routepage-input-bordered"
              />
            </div>
            <button className="routepage-search-btn" onClick={handleSearch} aria-label="Search">
              <FaSearch />
              <span className="routepage-search-btn-text">Search</span>
            </button>
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