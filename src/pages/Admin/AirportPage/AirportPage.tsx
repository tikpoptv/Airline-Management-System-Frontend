import React, { useState, useEffect } from 'react';
import { FaFilter, FaSort, FaPlus, FaSearch, FaChevronLeft, FaChevronRight, FaEllipsisV, FaPlane, FaFont, FaCity, FaGlobe } from 'react-icons/fa';
import './AirportPage.css'; 
import { getAirportList, searchAirports } from '../../../services/airportService'; 
import { Airport } from '../../../types/airport'; 
import { useNavigate } from 'react-router-dom';

const AirportPage: React.FC = () => {
  const [airportIdSearch, setAirportIdSearch] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');

  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20); 
  const [totalPages, setTotalPages] = useState(1);

  const [menuOpenIdx, setMenuOpenIdx] = useState<number | null>(null);
  const navigate = useNavigate();

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
  const currentEntries = airports.slice(indexOfFirstEntry, indexOfLastEntry);

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
            <button className="airportpage-action-btn"> 
              <FaSort /> Sort by 
            </button>
            <button className="airportpage-action-btn"> 
              <FaFilter /> Filter by
            </button>
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
                              <FaEllipsisV style={{ fontSize: '16px' }} />
                            </button>
                            {menuOpenIdx === idx && (
                              <div 
                                className="airportpage-action-dropdown"
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