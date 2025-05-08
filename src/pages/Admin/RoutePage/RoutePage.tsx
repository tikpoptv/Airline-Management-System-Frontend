import React, { useState, useEffect, useRef } from 'react';
import { FaMapMarkerAlt, FaExchangeAlt, FaFilter, FaSort, FaPlus, FaSearch, FaChevronLeft, FaChevronRight, FaEllipsisV } from 'react-icons/fa';
import './RoutePage.css';
import { getRouteList } from '../../../services/route/routeService';
import { Route } from '../../../types/route';
import { useNavigate } from 'react-router-dom';

const RoutePage: React.FC = () => {
  const [routeId, setRouteId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const [menuOpenIdx, setMenuOpenIdx] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRouteList();
        setRoutes(data);
        setTotalPages(Math.ceil(data.length / entriesPerPage));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, [entriesPerPage]);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSearch = () => {
    console.log('ค้นหา', { routeId, from, to });
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEntriesPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(event.target.value);
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  // Calculate pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = routes.slice(indexOfFirstEntry, indexOfLastEntry);

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const handleMenuClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation(); // Prevent event bubbling
    setMenuOpenIdx(menuOpenIdx === idx ? null : idx);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenIdx(null);
      }
    };

    if (menuOpenIdx !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpenIdx]);

  const handleViewDetail = (routeId: number) => {
    navigate(`/admin/pathways/routes/detail/${routeId}`);
  };

  return (
    <div className="routepage-outer">
      {menuOpenIdx !== null && <div className="routepage-overlay" onClick={() => setMenuOpenIdx(null)} />}
      
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
            <button 
              className="routepage-action-btn"
              onClick={() => navigate('/admin/pathways/routes/add')}
            >
              <FaPlus /> Add New
            </button>
          </div>

          <div className="routepage-table-container">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>Loading...</div>
            ) : error ? (
              <div style={{ color: 'red', textAlign: 'center', padding: '32px 0' }}>{error}</div>
            ) : (
              <>
                <table className={`routepage-table ${menuOpenIdx !== null ? 'has-dropdown-open' : ''}`}>
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Route ID</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Duration</th>
                      <th style={{ width: '48px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEntries.map((route, idx) => (
                      <tr 
                        key={route.route_id || idx}
                        className={menuOpenIdx === idx ? 'active-dropdown' : ''}
                      >
                        <td>
                          <span className={`routepage-status ${route.status}`}>
                            {route.status.charAt(0).toUpperCase() + route.status.slice(1)}
                          </span>
                        </td>
                        <td>{route.route_id}</td>
                        <td>{route.from_airport.city}, {route.from_airport.iata_code}</td>
                        <td>{route.to_airport.city}, {route.to_airport.iata_code}</td>
                        <td>{route.estimated_duration}</td>
                        <td style={{ textAlign: 'center', position: 'relative' }}>
                          <div className="routepage-dropdown-container">
                            <button
                              className="routepage-action-menu-btn"
                              aria-label="More actions"
                              onClick={(e) => handleMenuClick(e, idx)}
                            >
                              <FaEllipsisV />
                            </button>
                            {menuOpenIdx === idx && (
                              <div 
                                className="routepage-action-dropdown"
                                ref={menuRef}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button 
                                  className="routepage-action-dropdown-item"
                                  onClick={() => handleViewDetail(route.route_id)}
                                >
                                  View Detail
                                </button>
                                <button className="routepage-action-dropdown-item">
                                  Edit Detail
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="routepage-pagination">
                  <div className="routepage-pagination-entries">
                    <span>Show</span>
                    <select value={entriesPerPage} onChange={handleEntriesPerPageChange}>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span>entries</span>
                  </div>

                  <div className="routepage-pagination-nav">
                    <button
                      className="routepage-pagination-button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <FaChevronLeft /> Prev
                    </button>

                    <div className="routepage-pagination-info">
                      Page {currentPage} / {totalPages}
                    </div>

                    <button
                      className="routepage-pagination-button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next <FaChevronRight />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePage; 