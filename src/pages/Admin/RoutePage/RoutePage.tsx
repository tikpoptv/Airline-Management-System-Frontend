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
  const [allRoutes, setAllRoutes] = useState<Route[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // Sort and filter states
  const [sortOption, setSortOption] = useState<string | null>(null);
  const [filterOption, setFilterOption] = useState<string | null>(null);
  
  const [menuOpenIdx, setMenuOpenIdx] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const sortBtnRef = useRef<HTMLButtonElement>(null);
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  // Alternative approach - use regular state to control dropdown
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  const toggleDropdownState = (type: string) => {
    console.log('Clicked dropdown:', type, 'Previous state:', openDropdown);
    
    // Always close the current dropdown if it's the same as the clicked one, otherwise open the new one
    setOpenDropdown(prevState => prevState === type ? null : type);
  };

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getRouteList();
        setRoutes(data);
        setAllRoutes(data);
        setFilteredRoutes(data);
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
    console.log('Search', { routeId, from, to });
    
    const newFilteredRoutes = allRoutes.filter(route => {
      const matchesRouteId = !routeId || route.route_id.toString().includes(routeId);
      const matchesFrom = !from || 
        route.from_airport.city.toLowerCase().includes(from.toLowerCase()) || 
        route.from_airport.iata_code.toLowerCase().includes(from.toLowerCase());
      const matchesTo = !to || 
        route.to_airport.city.toLowerCase().includes(to.toLowerCase()) || 
        route.to_airport.iata_code.toLowerCase().includes(to.toLowerCase());
        
      return matchesRouteId && matchesFrom && matchesTo;
    });
    
    setFilteredRoutes(newFilteredRoutes);
    
    applyFiltersAndSort(newFilteredRoutes);
  };

  const applyFiltersAndSort = (dataToProcess: Route[]) => {
    const result = [...dataToProcess];
    
    if (filterOption) {
      if (filterOption === 'From (A-Z)') {
        // Sort data by origin city (From) from A-Z
        result.sort((a, b) => 
          a.from_airport.city.localeCompare(b.from_airport.city));
      } else if (filterOption === 'Duration (Low - High)') {
        result.sort((a, b) => {
          const [aHours, aMinutes] = a.estimated_duration.split(':').map(Number);
          const [bHours, bMinutes] = b.estimated_duration.split(':').map(Number);
          
          const aTotalMinutes = aHours * 60 + aMinutes;
          const bTotalMinutes = bHours * 60 + bMinutes;
          
          return aTotalMinutes - bTotalMinutes;
        });
      }
    }
    
    if (sortOption) {
      if (sortOption === 'Active (A-Z)') {
        result.sort((a, b) => {
          if (a.status === 'active' && b.status !== 'active') return -1;
          if (a.status !== 'active' && b.status === 'active') return 1;
          
          return a.from_airport.city.localeCompare(b.from_airport.city);
        });
      } else if (sortOption === 'Inactive (A-Z)') {
        result.sort((a, b) => {
          if (a.status === 'inactive' && b.status !== 'inactive') return -1;
          if (a.status !== 'inactive' && b.status === 'inactive') return 1;
          
          return a.from_airport.city.localeCompare(b.from_airport.city);
        });
      }
    }
    
    setRoutes(result);
    setTotalPages(Math.ceil(result.length / entriesPerPage));
    setCurrentPage(1);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEntriesPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(event.target.value);
    setEntriesPerPage(value);
    setCurrentPage(1);
    setTotalPages(Math.ceil(routes.length / value));
  };

  // Sort handler - Update to close dropdown with state
  const handleSortOption = (option: string) => {
    console.log('Selected Sort option:', option);
    setSortOption(prevSortOption => prevSortOption === option ? null : option); // Update state, allow unsetting
    setOpenDropdown(null); // Close dropdown after selection
    // applyFiltersAndSort will be called by useEffect
  };

  // Filter handler - Update to close dropdown with state
  const handleFilterOption = (option: string) => {
    console.log('Selected Filter option:', option);
    setFilterOption(prevFilterOption => prevFilterOption === option ? null : option); // Update state, allow unsetting
    setOpenDropdown(null); // Close dropdown after selection
    // applyFiltersAndSort will be called by useEffect
  };

  // useEffect to apply sorting and filtering when options change
  useEffect(() => {
    // This effect runs when sortOption or filterOption changes,
    // ensuring that applyFiltersAndSort uses the updated state.
    console.log('useEffect for sort/filter triggered. Applying to filteredRoutes. Sort:', sortOption, 'Filter:', filterOption);
    if (allRoutes.length > 0) { // Ensure initial data is loaded before attempting to sort/filter
        applyFiltersAndSort(filteredRoutes);
    }
  }, [sortOption, filterOption, filteredRoutes, allRoutes.length]); // Add allRoutes.length to ensure it runs after initial load if needed.
                                                                  // filteredRoutes is added because if search changes the base data, we need to re-apply sort/filter.
                                                                  // However, handleSearch already calls applyFiltersAndSort.
                                                                  // Let's refine dependencies to [sortOption, filterOption, allRoutes.length]
                                                                  // and ensure applyFiltersAndSort inside handleSearch uses the most up-to-date filteredRoutes.
                                                                  // For now, keeping filteredRoutes in dependency for safety, will monitor.

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

  // Update click outside handling to use state approach
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Close dropdown when clicking outside dropdown or button that opens dropdown
      if (openDropdown && 
          !target.closest('.routepage-dropdown') && 
          !target.closest('.routepage-action-btn')) {
        setOpenDropdown(null);
      }
      
      // Close action menu when clicking elsewhere
      if (menuOpenIdx !== null && menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpenIdx(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown, menuOpenIdx]);

  const handleViewDetail = (routeId: number) => {
    navigate(`/admin/pathways/routes/detail/${routeId}`);
  };

  const handleEditRoute = (routeId: number) => {
    navigate(`/admin/pathways/routes/edit/${routeId}`);
  };

  // Add function to reset search
  const handleResetSearch = () => {
    setRouteId('');
    setFrom('');
    setTo('');
    setFilteredRoutes(allRoutes);
    
    // Reset filter and sort options too
    setSortOption(null);
    setFilterOption(null);
    
    setRoutes(allRoutes);
    setCurrentPage(1);
    setTotalPages(Math.ceil(allRoutes.length / entriesPerPage));
  };

  // Add function to reset filters and sorting
  const handleResetFilters = () => {
    setSortOption(null);
    setFilterOption(null);
    setOpenDropdown(null); // Close dropdown
    // The useEffect listening to sortOption and filterOption will now
    // call applyFiltersAndSort with null options, effectively resetting the view
    // to filteredRoutes without additional sorting/filtering.
    // applyFiltersAndSort also handles pagination reset.
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
            <div className="routepage-search-buttons">
              <button className="routepage-search-btn" onClick={handleSearch} aria-label="Search">
                <FaSearch />
                <span className="routepage-search-btn-text">Search</span>
              </button>
              {(routeId || from || to) && (
                <button className="routepage-reset-btn" onClick={handleResetSearch} aria-label="Reset">
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="routepage-actionbar">
            <div style={{ position: 'relative' }}>
              <button 
                ref={sortBtnRef}
                className={`routepage-action-btn ${sortOption ? 'active' : ''}`}
                onClick={() => toggleDropdownState('sort')}
              >
                <FaSort style={{ fontSize: '12px' }} /> 
                <span>Sort by</span>
                {sortOption && <span className="separator">:</span>}
                {sortOption && <span className="option-value">{sortOption}</span>}
              </button>
              {openDropdown === 'sort' && (
                <div className="routepage-dropdown">
                  <button
                    className={`routepage-dropdown-item ${sortOption === 'Active (A-Z)' ? 'active' : ''}`}
                    onClick={() => handleSortOption('Active (A-Z)')}
                  >
                    Active (A-Z)
                  </button>
                  <button
                    className={`routepage-dropdown-item ${sortOption === 'Inactive (A-Z)' ? 'active' : ''}`}
                    onClick={() => handleSortOption('Inactive (A-Z)')}
                  >
                    Inactive (A-Z)
                  </button>
                </div>
              )}
            </div>
            
            <div style={{ position: 'relative' }}>
              <button 
                ref={filterBtnRef}
                className={`routepage-action-btn ${filterOption ? 'active' : ''}`}
                onClick={() => toggleDropdownState('filter')}
              >
                <FaFilter style={{ fontSize: '12px' }} />
                <span>Filter by</span>
                {filterOption && <span className="separator">:</span>}
                {filterOption && <span className="option-value">{filterOption}</span>}
              </button>
              {openDropdown === 'filter' && (
                <div className="routepage-dropdown">
                  <button
                    className={`routepage-dropdown-item ${filterOption === 'From (A-Z)' ? 'active' : ''}`}
                    onClick={() => handleFilterOption('From (A-Z)')}
                  >
                    From (A-Z)
                  </button>
                  <button
                    className={`routepage-dropdown-item ${filterOption === 'Duration (Low - High)' ? 'active' : ''}`}
                    onClick={() => handleFilterOption('Duration (Low - High)')}
                  >
                    Duration (Low - High)
                  </button>
                </div>
              )}
            </div>
            
            {(sortOption || filterOption) && (
              <button 
                className="routepage-reset-filter-btn"
                onClick={handleResetFilters}
              >
                Reset Filters
              </button>
            )}
            
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
                    {currentEntries.length > 0 ? (
                      currentEntries.map((route, idx) => (
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
                                  <button 
                                    className="routepage-action-dropdown-item"
                                    onClick={() => handleEditRoute(route.route_id)}
                                  >
                                    Edit Detail
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '32px 0' }}>
                          No routes found
                        </td>
                      </tr>
                    )}
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