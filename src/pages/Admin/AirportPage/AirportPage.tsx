import React, { useState, useEffect, useRef } from 'react';
import { FaFilter, FaPlus, FaSearch, FaChevronLeft, FaChevronRight, FaEllipsisV, FaPlane, FaFont, FaCity, FaGlobe, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import './AirportPage.css'; 
import { getAirportList, searchAirports } from '../../../services/airportService'; 
import { Airport } from '../../../types/airport'; 
import { useNavigate } from 'react-router-dom';

type SortField = 'airport_id' | 'name' | 'city' | 'country' | 'status';
type SortOrder = 'asc' | 'desc';
type FilterStatus = 'all' | 'active' | 'inactive';

const AirportPage: React.FC = () => {
  const [airportIdSearch, setAirportIdSearch] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20); 
  const [totalPages, setTotalPages] = useState(1);

  const [menuOpenIdx, setMenuOpenIdx] = useState<number | null>(null);
  const navigate = useNavigate();

  // Sorting states
  const [sortField, setSortField] = useState<SortField>('airport_id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  // Filtering states
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAirports = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAirportList(); 
        setAirports(data);
        setTotalPages(Math.ceil(data.length / entriesPerPage));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error fetching airports');
      } finally {
        setLoading(false);
      }
    };
    fetchAirports();
  }, [entriesPerPage]);

  const handleSearch = () => {
    console.log('Search airports by:', { airportIdSearch, nameSearch, citySearch, countrySearch });
    const fetchFilteredAirports = async () => {
      setLoading(true);
      setError(null);
      try {
        const filteredData = await searchAirports({
          airportId: airportIdSearch,
          name: nameSearch,
          city: citySearch,
          country: countrySearch
        });
        setAirports(filteredData);
        setTotalPages(Math.ceil(filteredData.length / entriesPerPage));
        setCurrentPage(1);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error searching airports');
      } finally {
        setLoading(false);
      }
    };
    fetchFilteredAirports();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEntriesPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(event.target.value);
    setEntriesPerPage(value);
    setCurrentPage(1);
  };

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;

  // Sort function
  const sortAirports = (airports: Airport[]): Airport[] => {
    return [...airports].sort((a, b) => {
      let compareA: string | number = '';
      let compareB: string | number = '';

      switch (sortField) {
        case 'airport_id':
          compareA = a.airport_id;
          compareB = b.airport_id;
          break;
        case 'name':
          compareA = a.name.toLowerCase();
          compareB = b.name.toLowerCase();
          break;
        case 'city':
          compareA = a.city.toLowerCase();
          compareB = b.city.toLowerCase();
          break;
        case 'country':
          compareA = a.country.toLowerCase();
          compareB = b.country.toLowerCase();
          break;
        case 'status':
          compareA = a.status.toLowerCase();
          compareB = b.status.toLowerCase();
          break;
      }

      if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Filter function
  const filterAirports = (airports: Airport[]): Airport[] => {
    if (filterStatus === 'all') return airports;
    return airports.filter(airport => airport.status === filterStatus);
  };

  // Process airports with sort and filter
  const processedAirports = filterAirports(sortAirports(airports));
  const currentEntries = processedAirports.slice(indexOfFirstEntry, indexOfLastEntry);

  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const handleMenuClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setMenuOpenIdx(menuOpenIdx === idx ? null : idx);
  };

  const handleViewAirportDetail = (airportId: number) => {
    navigate(`/admin/pathways/airport/detail/${airportId}`);
    console.log("View airport:", airportId);
  };

  const handleEditAirport = (airportId: number) => {
    navigate(`/admin/pathways/airport/edit/${airportId}`);
    console.log("Edit airport:", airportId);
  };
  
  const handleAddNewAirport = () => {
    navigate('/admin/pathways/airport/add');
    console.log("Add new airport");
  };

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setShowFilterMenu(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenIdx(null);
      }
    };

    if (showSortMenu || showFilterMenu || menuOpenIdx !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSortMenu, showFilterMenu, menuOpenIdx]);

  return (
    <div className="airportpage-outer">
      {menuOpenIdx !== null && <div className="airportpage-overlay" onClick={() => setMenuOpenIdx(null)} />}
      
      <div className="airportpage-container">
        <div className="airportpage-subtitle">Airport</div>
        <h1 className="airportpage-title">Airport management</h1>
        <div className="airportpage-card">
          
          <div className="airportpage-searchbar"> 
            <div className="airportpage-input-group">
              <FaPlane className="airportpage-icon" />
              <input
                type="text"
                placeholder="Airport ID"
                value={airportIdSearch}
                onChange={e => setAirportIdSearch(e.target.value)}
                className="airportpage-input airportpage-input-bordered"
              />
            </div>
            <div className="airportpage-input-group">
              <FaFont className="airportpage-icon" />
              <input
                type="text"
                placeholder="Name / IATA"
                value={nameSearch}
                onChange={e => setNameSearch(e.target.value)}
                className="airportpage-input airportpage-input-bordered"
              />
            </div>
            <div className="airportpage-input-group">
              <FaCity className="airportpage-icon" />
              <input
                type="text"
                placeholder="City"
                value={citySearch}
                onChange={e => setCitySearch(e.target.value)}
                className="airportpage-input airportpage-input-bordered"
              />
            </div>
             <div className="airportpage-input-group">
              <FaGlobe className="airportpage-icon" />
              <input
                type="text"
                placeholder="Country"
                value={countrySearch}
                onChange={e => setCountrySearch(e.target.value)}
                className="airportpage-input airportpage-input-bordered"
              />
            </div>
            <button className="airportpage-search-btn" onClick={handleSearch} aria-label="Search">
              <FaSearch />
              <span className="airportpage-search-btn-text">Search</span>
            </button>
          </div>

          <div className="airportpage-actionbar">
            <div className="airportpage-sort-container" ref={sortMenuRef}>
              <button 
                className={`airportpage-action-btn ${showSortMenu ? 'active' : ''}`}
                onClick={() => setShowSortMenu(!showSortMenu)}
              > 
                {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />} Sort by 
              </button>
              {showSortMenu && (
                <div className="airportpage-sort-menu">
                  <button 
                    className={`airportpage-sort-item ${sortField === 'airport_id' ? 'active' : ''}`}
                    onClick={() => {
                      setSortField('airport_id');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      setShowSortMenu(false);
                    }}
                  >
                    Airport ID {sortField === 'airport_id' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                  <button 
                    className={`airportpage-sort-item ${sortField === 'name' ? 'active' : ''}`}
                    onClick={() => {
                      setSortField('name');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      setShowSortMenu(false);
                    }}
                  >
                    Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                  <button 
                    className={`airportpage-sort-item ${sortField === 'city' ? 'active' : ''}`}
                    onClick={() => {
                      setSortField('city');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      setShowSortMenu(false);
                    }}
                  >
                    City {sortField === 'city' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                  <button 
                    className={`airportpage-sort-item ${sortField === 'country' ? 'active' : ''}`}
                    onClick={() => {
                      setSortField('country');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      setShowSortMenu(false);
                    }}
                  >
                    Country {sortField === 'country' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                  <button 
                    className={`airportpage-sort-item ${sortField === 'status' ? 'active' : ''}`}
                    onClick={() => {
                      setSortField('status');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      setShowSortMenu(false);
                    }}
                  >
                    Status {sortField === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </button>
                </div>
              )}
            </div>
            <div className="airportpage-filter-container" ref={filterMenuRef}>
              <button 
                className={`airportpage-action-btn ${showFilterMenu ? 'active' : ''}`}
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              > 
                <FaFilter /> Filter by
              </button>
              {showFilterMenu && (
                <div className="airportpage-filter-menu">
                  <button 
                    className={`airportpage-filter-item ${filterStatus === 'all' ? 'active' : ''}`}
                    onClick={() => {
                      setFilterStatus('all');
                      setShowFilterMenu(false);
                    }}
                  >
                    All Airports
                  </button>
                  <button 
                    className={`airportpage-filter-item ${filterStatus === 'active' ? 'active' : ''}`}
                    onClick={() => {
                      setFilterStatus('active');
                      setShowFilterMenu(false);
                    }}
                  >
                    Active Only
                  </button>
                  <button 
                    className={`airportpage-filter-item ${filterStatus === 'inactive' ? 'active' : ''}`}
                    onClick={() => {
                      setFilterStatus('inactive');
                      setShowFilterMenu(false);
                    }}
                  >
                    Inactive Only
                  </button>
                </div>
              )}
            </div>
            <button 
              className="airportpage-action-btn"
              onClick={handleAddNewAirport}
            >
              <FaPlus /> Add New
            </button>
          </div>

          <div className="airportpage-table-container">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>Loading airports...</div>
            ) : error ? (
              <div style={{ color: 'red', textAlign: 'center', padding: '32px 0' }}>Error: {error}</div>
            ) : (
              <>
                <table className={`airportpage-table ${menuOpenIdx !== null ? 'has-dropdown-open' : ''}`}>
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Airport ID</th>
                      <th>Name/iata_code</th>
                      <th>City</th>
                      <th>Country</th>
                      <th style={{ width: '80px', textAlign: 'center' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEntries.map((airport, idx) => (
                      <tr 
                        key={airport.airport_id || idx} 
                        className={menuOpenIdx === idx ? 'active-dropdown' : ''}
                      >
                        <td>
                          <span className={`airportpage-status ${airport.status}`}>
                            {airport.status.charAt(0).toUpperCase() + airport.status.slice(1)}
                          </span>
                        </td>
                        <td>{airport.airport_id}</td>
                        <td>{airport.name} ({airport.iata_code})</td>
                        <td>{airport.city}</td>
                        <td>{airport.country}</td>
                        <td style={{ textAlign: 'center', position: 'relative' }}>
                          <div className="airportpage-dropdown-container">
                            <button
                              className="airportpage-action-menu-btn"
                              aria-label="More actions"
                              onClick={(e) => handleMenuClick(e, idx)}
                            >
                              <FaEllipsisV />
                            </button>
                            {menuOpenIdx === idx && (
                              <div 
                                className="airportpage-action-dropdown"
                                ref={menuRef}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button 
                                  className="airportpage-action-dropdown-item"
                                  onClick={() => handleViewAirportDetail(airport.airport_id)}
                                >
                                  View Detail
                                </button>
                                <button 
                                  className="airportpage-action-dropdown-item"
                                  onClick={() => handleEditAirport(airport.airport_id)}
                                >
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
                
                <div className="airportpage-pagination">
                  <div className="airportpage-pagination-entries">
                    <span>Show</span>
                    <select value={entriesPerPage} onChange={handleEntriesPerPageChange}>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span>entries</span>
                  </div>

                  <div className="airportpage-pagination-nav">
                    <button
                      className="airportpage-pagination-button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <FaChevronLeft /> Prev
                    </button>

                    <div className="airportpage-pagination-info">
                      Page {currentPage} / {totalPages}
                    </div>

                    <button
                      className="airportpage-pagination-button"
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

export default AirportPage; 