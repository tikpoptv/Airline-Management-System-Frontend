import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaSort, FaFilter } from 'react-icons/fa';
import './MaintenancePage.css';
import { useNavigate } from 'react-router-dom';
import { MaintenanceLog, MaintenanceSearchParams, MaintenanceStatus } from '../../../types/maintenance';
import { getMaintenanceLogs } from '../../../services/maintenance/maintenanceService';

// Types
interface Maintenance {
  log_id: number;
  aircraft_id: number;
  model: string;
  date: string;
  user_id: number;
  user_name: string;
  location: string;
  status: 'completed' | 'cancelled' | 'pending' | 'in progress';
}

interface SearchFilters {
  logId: string;
  aircraftId: string;
  dateFrom: string;
  dateTo: string;
  status: string;
  location: string;
}

const MaintenancePage: React.FC = () => {
  const navigate = useNavigate();
  
  // States
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    logId: '',
    aircraftId: '',
    dateFrom: '',
    dateTo: '',
    status: '',
    location: ''
  });
  const [maintenances, setMaintenances] = useState<MaintenanceLog[]>([]);
  const [filteredMaintenances, setFilteredMaintenances] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // Sort states
  const [sortOption, setSortOption] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Fetch maintenance logs
  const fetchMaintenanceLogs = async (params?: MaintenanceSearchParams) => {
    console.log('🚀 Fetching maintenance logs with params:', params);
    try {
      setLoading(true);
      setError(null);
      
      const data = await getMaintenanceLogs(params);
      console.log('📦 Received maintenance data:', data);
      
      if (Array.isArray(data)) {
        setMaintenances(data);
        setFilteredMaintenances(data);
        setTotalPages(Math.ceil(data.length / entriesPerPage));
        console.log('✅ Data set successfully:', { 
          total: data.length,
          currentPage,
          entriesPerPage,
          totalPages: Math.ceil(data.length / entriesPerPage)
        });
      } else {
        console.error('❌ Received data is not an array:', data);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      console.error('❌ Error fetching maintenance logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch maintenance logs');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    console.log('🔄 Component mounted - Starting initial fetch');
    fetchMaintenanceLogs();
  }, []);

  const handleSearchFilterChange = (field: keyof SearchFilters, value: string) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    const params: MaintenanceSearchParams = {};
    
    if (searchFilters.aircraftId) {
      params.aircraft_id = parseInt(searchFilters.aircraftId);
    }
    
    if (searchFilters.status) {
      params.status = searchFilters.status as MaintenanceStatus;
    }

    fetchMaintenanceLogs(params);
  };

  const applySort = (dataToProcess: MaintenanceLog[]) => {
    const result = [...dataToProcess];
    
    if (sortOption) {
      if (sortOption === 'Date (Newest)') {
        result.sort((a, b) => 
          new Date(b.date_of_maintenance).getTime() - new Date(a.date_of_maintenance).getTime()
        );
      } else if (sortOption === 'Date (Oldest)') {
        result.sort((a, b) => 
          new Date(a.date_of_maintenance).getTime() - new Date(b.date_of_maintenance).getTime()
        );
      }
    }
    
    setMaintenances(result);
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
    setTotalPages(Math.ceil(maintenances.length / value));
  };

  const handleResetSearch = () => {
    setSearchFilters({
      logId: '',
      aircraftId: '',
      dateFrom: '',
      dateTo: '',
      status: '',
      location: ''
    });
    fetchMaintenanceLogs();
  };

  // Calculate current entries for pagination
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = maintenances.slice(indexOfFirstEntry, indexOfLastEntry);
  console.log('📑 Current entries:', { 
    start: indexOfFirstEntry,
    end: indexOfLastEntry,
    entries: currentEntries 
  });

  // Return early if loading
  if (loading) {
    return (
      <div className="maintenance-outer">
        <div className="maintenance-container">
          <div className="maintenance-subtitle">Maintenance</div>
          <h1 className="maintenance-title">Maintenance Log</h1>
          <div className="maintenance-card">
            <div className="maintenance-loading">Loading maintenance logs...</div>
          </div>
        </div>
      </div>
    );
  }

  // Return early if error
  if (error) {
    return (
      <div className="maintenance-outer">
        <div className="maintenance-container">
          <div className="maintenance-subtitle">Maintenance</div>
          <h1 className="maintenance-title">Maintenance Log</h1>
          <div className="maintenance-card">
            <div className="maintenance-error">
              Error: {error}
              <button className="maintenance-reset-btn" onClick={() => fetchMaintenanceLogs()}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="maintenance-outer">
      <div className="maintenance-container">
        <div className="maintenance-subtitle">Maintenance</div>
        <h1 className="maintenance-title">Maintenance Log</h1>
        
        <div className="maintenance-card">
          <div className="maintenance-searchbar">
            <div className="maintenance-input-group">
              <input
                type="text"
                className="maintenance-input"
                placeholder="Search by Log ID..."
                value={searchFilters.logId}
                onChange={(e) => handleSearchFilterChange('logId', e.target.value)}
              />
            </div>
            <div className="maintenance-search-buttons">
              <button 
                className="maintenance-filter-btn"
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              >
                <FaFilter /> Filters
              </button>
              <button className="maintenance-search-btn" onClick={handleSearch}>
                <FaSearch /> Search
              </button>
              <button className="maintenance-reset-btn" onClick={handleResetSearch}>
                Reset
              </button>
            </div>
          </div>

          {showAdvancedSearch && (
            <div className="maintenance-advanced-search">
              <div className="maintenance-advanced-search-grid">
                <div className="maintenance-input-group">
                  <label>Aircraft ID</label>
                  <input
                    type="text"
                    className="maintenance-input"
                    placeholder="Enter Aircraft ID"
                    value={searchFilters.aircraftId}
                    onChange={(e) => handleSearchFilterChange('aircraftId', e.target.value)}
                  />
                </div>
                <div className="maintenance-input-group">
                  <label>Date From</label>
                  <input
                    type="date"
                    className="maintenance-input"
                    value={searchFilters.dateFrom}
                    onChange={(e) => handleSearchFilterChange('dateFrom', e.target.value)}
                  />
                </div>
                <div className="maintenance-input-group">
                  <label>Date To</label>
                  <input
                    type="date"
                    className="maintenance-input"
                    value={searchFilters.dateTo}
                    onChange={(e) => handleSearchFilterChange('dateTo', e.target.value)}
                  />
                </div>
                <div className="maintenance-input-group">
                  <label>Status</label>
                  <select
                    className="maintenance-input"
                    value={searchFilters.status}
                    onChange={(e) => handleSearchFilterChange('status', e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="maintenance-input-group">
                  <label>Location</label>
                  <input
                    type="text"
                    className="maintenance-input"
                    placeholder="Enter Location"
                    value={searchFilters.location}
                    onChange={(e) => handleSearchFilterChange('location', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="maintenance-actionbar">
            <button
              className="maintenance-action-btn"
              onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
            >
              <FaSort /> Sort by
            </button>
            {openDropdown === 'sort' && (
              <div className="maintenance-dropdown">
                <button
                  className={`maintenance-dropdown-item ${sortOption === 'Date (Newest)' ? 'active' : ''}`}
                  onClick={() => {
                    setSortOption('Date (Newest)');
                    setOpenDropdown(null);
                    applySort(filteredMaintenances);
                  }}
                >
                  Date (Newest)
                </button>
                <button
                  className={`maintenance-dropdown-item ${sortOption === 'Date (Oldest)' ? 'active' : ''}`}
                  onClick={() => {
                    setSortOption('Date (Oldest)');
                    setOpenDropdown(null);
                    applySort(filteredMaintenances);
                  }}
                >
                  Date (Oldest)
                </button>
              </div>
            )}
            <button 
              className="maintenance-action-btn" 
              onClick={() => navigate('/admin/maintenance/add')}
            >
              <FaPlus /> Add New
            </button>
          </div>

          {/* Table */}
          <div className="maintenance-table-container">
            <table className="maintenance-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Log ID</th>
                  <th>Aircraft ID</th>
                  <th>Model</th>
                  <th>Date</th>
                  <th>User ID</th>
                  <th>User Name</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {maintenances.length > 0 ? (
                  currentEntries.map((maintenance) => (
                    <tr key={maintenance.log_id} onClick={() => console.log('Row clicked:', maintenance)}>
                      <td>
                        <span className={`maintenance-status ${maintenance.status.toLowerCase().replace(' ', '-')}`}>
                          {maintenance.status}
                        </span>
                      </td>
                      <td>{maintenance.log_id}</td>
                      <td>{maintenance.aircraft_id}</td>
                      <td>{maintenance.aircraft?.model || 'N/A'}</td>
                      <td>{new Date(maintenance.date_of_maintenance).toLocaleDateString()}</td>
                      <td>{maintenance.assigned_user?.user_id || 'N/A'}</td>
                      <td>{maintenance.assigned_user?.username || 'N/A'}</td>
                      <td>{maintenance.maintenance_location}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="maintenance-empty">
                      No maintenance records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="maintenance-pagination">
              <div className="maintenance-pagination-entries">
                <span>Show</span>
                <select value={entriesPerPage} onChange={handleEntriesPerPageChange}>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>entries</span>
              </div>

              <div className="maintenance-pagination-nav">
                <button
                  className="maintenance-pagination-button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>

                <div className="maintenance-pagination-info">
                  Page {currentPage} / {totalPages}
                </div>

                <button
                  className="maintenance-pagination-button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage; 