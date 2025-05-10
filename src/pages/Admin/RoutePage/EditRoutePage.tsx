import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select, {
  StylesConfig,
  PlaceholderProps,
  SingleValueProps,
  GroupBase,
} from 'react-select';
import './EditRoutePage.css';
import { getAirportList } from '../../../services/airportService';
import { Airport } from '../../../types/airport';
import GlobeMap, { Airport as GlobeAirport } from './components/GlobeMap/GlobeMap';
import { getRouteById, updateRouteStatus } from '../../../services/route/routeService';
import { Route } from '../../../types/route';

interface AirportInputState {
  airport_id: number | null;
  airport_name: string;
  iata_code: string;
  city: string;
  country: string;
}

interface AirportOptionType {
  value: number;
  label: string;
  airport: Airport;
}

const EditRoutePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State variables
  const [distance, setDistance] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [durationSeconds, setDurationSeconds] = useState('');
  const [status, setStatus] = useState('active');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [fromInput, setFromInput] = useState<AirportInputState>({ airport_id: null, airport_name: '', iata_code: '', city: '', country: '' });
  const [toInput, setToInput] = useState<AirportInputState>({ airport_id: null, airport_name: '', iata_code: '', city: '', country: '' });
  
  const [airportOptions, setAirportOptions] = useState<AirportOptionType[]>([]);
  const [loadingAirports, setLoadingAirports] = useState(true);
  const [airportFetchError, setAirportFetchError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  
  const [mapFromAirport, setMapFromAirport] = useState<GlobeAirport | null>(null);
  const [mapToAirport, setMapToAirport] = useState<GlobeAirport | null>(null);
  
  // State for success popup
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Fetch airports for dropdown options
  useEffect(() => {
    const fetchAirportsAndSetOptions = async () => {
      setLoadingAirports(true);
      setAirportFetchError(null);
      try {
        const airportData = await getAirportList();
        const options = airportData.map(ap => ({
          value: ap.airport_id,
          label: `${ap.iata_code} - ${ap.name}`,
          airport: ap,
        }));
        setAirportOptions(options);
      } catch (error) {
        console.error('Failed to load airports in component:', error);
        setAirportFetchError(error instanceof Error ? error.message : 'Could not fetch airports.');
      } finally {
        setLoadingAirports(false);
      }
    };

    fetchAirportsAndSetOptions();
  }, []);

  // Fetch route details
  useEffect(() => {
    const fetchRouteDetails = async () => {
      if (!id) {
        setError('Route ID not found');
        setLoading(false);
        return;
      }

      try {
        const routeId = parseInt(id, 10);
        if (Number.isNaN(routeId)) {
          throw new Error('Invalid Route ID');
        }

        const routeData = await getRouteById(routeId);

        if (routeData) {
          setRoute(routeData);
          
          // Set form fields with route data
          setDistance(routeData.distance.toString());
          
          // Parse duration (HH:MM:SS format)
          const durationParts = routeData.estimated_duration.split(':');
          setDurationHours(durationParts[0] || '0');
          setDurationMinutes(durationParts[1] || '0');
          setDurationSeconds(durationParts[2] || '0');
          
          setStatus(routeData.status);
          
          // Set from airport
          setFromInput({
            airport_id: routeData.from_airport.airport_id,
            airport_name: routeData.from_airport.name,
            iata_code: routeData.from_airport.iata_code,
            city: routeData.from_airport.city,
            country: routeData.from_airport.country,
          });
          
          // Set to airport
          setToInput({
            airport_id: routeData.to_airport.airport_id,
            airport_name: routeData.to_airport.name,
            iata_code: routeData.to_airport.iata_code,
            city: routeData.to_airport.city,
            country: routeData.to_airport.country,
          });

          // Set map data
          setMapFromAirport({
            iata_code: routeData.from_airport.iata_code,
            name: routeData.from_airport.name,
            lat: routeData.from_airport.latitude,
            lon: routeData.from_airport.longitude
          });
          
          setMapToAirport({
            iata_code: routeData.to_airport.iata_code,
            name: routeData.to_airport.name,
            lat: routeData.to_airport.latitude,
            lon: routeData.to_airport.longitude
          });
        } else {
          setError('Route data not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load route data');
      } finally {
        setLoading(false);
      }
    };

    fetchRouteDetails();
  }, [id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.custom-select-wrapper')) {
        setStatusDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleStatusChange = (newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus(newStatus);
    setStatusDropdownOpen(false);
  };

  const toggleStatusDropdown = () => {
    setStatusDropdownOpen(!statusDropdownOpen);
  };

  const handleSave = async () => {
    if (!id || !route) return;
    
    setSaving(true);
    setSaveError(null);
    
    try {
      const routeId = parseInt(id, 10);
      
      // ส่งเฉพาะสถานะไปอัปเดต
      await updateRouteStatus(routeId, { status: status as 'active' | 'inactive' });
      
      // แสดง success popup แทนการใช้ alert
      setShowSuccessPopup(true);
      
      // หน่วงเวลาก่อนกลับไปหน้ารายการเส้นทาง
      setTimeout(() => {
        navigate('/admin/pathways/routes');
      }, 2000);
    } catch (err) {
      console.error('Error updating route status:', err);
      setSaveError(err instanceof Error ? err.message : 'Could not save changes');
    } finally {
      setSaving(false);
    }
  };

  // Custom styles for React Select (readonly)
  const selectCustomStyles: StylesConfig<AirportOptionType, false, GroupBase<AirportOptionType>> = {
    container: (provided) => ({
      ...provided,
      boxShadow: 'none',
      outline: 'none',
      border: 'none',
      opacity: 0.7,
      '& *': {
        boxShadow: 'none !important',
        outline: 'none !important',
      }
    }),
    control: (provided) => ({
      ...provided,
      minHeight: '42px',
      borderColor: '#d1d9e0',
      boxShadow: 'none',
      outline: 'none',
      backgroundColor: '#f5f5f5',
      cursor: 'not-allowed',
      '&:hover': {
        borderColor: '#d1d9e0',
      },
      borderRadius: '8px',
      fontSize: '1em',
    }),
    valueContainer: (provided) => ({
      ...provided,
      boxShadow: 'none',
      outline: 'none',
      border: 'none',
      paddingLeft: '8px',
    }),
    placeholder: (
      provided, 
      { isDisabled }: PlaceholderProps<AirportOptionType, false, GroupBase<AirportOptionType>>
    ) => ({
      ...provided,
      color: isDisabled ? '#aaa' : '#868e96',
      boxShadow: 'none',
      outline: 'none',
      border: 'none',
      padding: '0',
      margin: '0',
    }),
    singleValue: (
      provided, 
      { isDisabled }: SingleValueProps<AirportOptionType, false, GroupBase<AirportOptionType>>
    ) => ({
      ...provided,
      color: isDisabled ? '#666' : '#495057',
    }),
    menu: () => ({
      display: 'none', // Hide dropdown menu
    }),
    input: (provided) => ({
      ...provided,
      color: '#495057',
      caretColor: 'transparent',
      background: 'transparent',
      opacity: 0.7,
      margin: '0px',
      padding: '0px',
      border: '0px',
      outline: '0px',
      boxShadow: 'none',
    }),
    dropdownIndicator: () => ({
      display: 'none',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
  };

  // Success Popup component
  const SuccessPopup: React.FC = () => {
    if (!showSuccessPopup) return null;
    
    return (
      <div className="success-popup-overlay">
        <div className="success-popup">
          <div className="success-popup-icon">✓</div>
          <div className="success-popup-message">
            <h3>Changes Saved Successfully!</h3>
            <p>Route status has been updated successfully</p>
          </div>
          <div className="success-popup-progress-bar">
            <div className="success-popup-progress"></div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="edit-route-loading">
        <div className="edit-route-loading__spinner" />
        <div className="edit-route-loading__text">
          Loading route details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-route-error">
        <div className="edit-route-error__icon">⚠️</div>
        <div className="edit-route-error__message">{error}</div>
        <button className="edit-route-error__button" onClick={() => navigate('/admin/pathways/routes')}>
          Back to Routes List
        </button>
      </div>
    );
  }

  return (
    <div className="edit-route-page">
      {/* Success Popup */}
      <SuccessPopup />
      
      {/* Header */}
      <div className="edit-route-header">
        <div className="edit-route-breadcrumb">
          <button className="edit-route-back-btn" onClick={() => navigate('/admin/pathways/routes')}>
            ←
          </button>
          <span>Routes</span>
          <span className="edit-route-breadcrumb-separator">/</span>
          <span>Edit</span>
        </div>

        <div className="edit-route-title">
          <h1>Edit Route #{route?.route_id}</h1>
        </div>
      </div>
      
      {/* Main Form Container */}
      <div className="edit-route-container">
        {airportFetchError && <p style={{ color: 'red' }}>Error loading airports: {airportFetchError}</p>}
        {saveError && (
          <div className="save-error-message">
            <p style={{ color: 'red', padding: '12px', background: '#fff8f8', borderRadius: '8px', border: '1px solid #f5c6cb', marginBottom: '20px' }}>
              {saveError}
            </p>
          </div>
        )}

        <div className="form-section top-section">
          <div className="form-group">
            <label htmlFor="distance">Distance</label>
            <div className="distance-input-wrapper">
              <input 
                type="text" 
                id="distance" 
                name="distance" 
                value={distance} 
                readOnly
                disabled
                placeholder="Enter distance number" 
                className="form-control-base disabled"
                style={{
                  paddingRight: '45px',
                  backgroundColor: '#f5f5f5',
                  cursor: 'not-allowed',
                  opacity: 0.8
                }}
              />
              <span className="distance-unit">km</span>
            </div>
          </div>
          <div className="form-group duration-group">
            <label>Duration</label>
            <div className="duration-inputs">
              <div className="duration-input-container">
                <input 
                  type="text" 
                  id="durationHours" 
                  name="durationHours" 
                  value={durationHours}
                  readOnly
                  disabled
                  placeholder="00"
                  className="disabled"
                  style={{
                    backgroundColor: '#f5f5f5',
                    cursor: 'not-allowed',
                    opacity: 0.8
                  }}
                />
                <span className="duration-label">Hours</span>
              </div>
              <span className="duration-separator">:</span>
              <div className="duration-input-container">
                <input 
                  type="text" 
                  id="durationMinutes" 
                  name="durationMinutes" 
                  value={durationMinutes}
                  readOnly
                  disabled
                  placeholder="00"
                  className="disabled"
                  style={{
                    backgroundColor: '#f5f5f5',
                    cursor: 'not-allowed',
                    opacity: 0.8
                  }}
                />
                <span className="duration-label">Minutes</span>
              </div>
              <span className="duration-separator">:</span>
              <div className="duration-input-container">
                <input 
                  type="text" 
                  id="durationSeconds" 
                  name="durationSeconds" 
                  value={durationSeconds}
                  readOnly
                  disabled
                  placeholder="00"
                  className="disabled"
                  style={{
                    backgroundColor: '#f5f5f5',
                    cursor: 'not-allowed',
                    opacity: 0.8
                  }}
                />
                <span className="duration-label">Seconds</span>
              </div>
            </div>
          </div>
          <div className="form-group status-group">
            <label htmlFor="status">STATUS</label>
            <div 
              className="custom-select-wrapper" 
              onClick={toggleStatusDropdown}
            >
              <div className="custom-select-selected">
                {status === 'active' ? 'Active' : 'Inactive'}
                <span className="custom-select-arrow"></span>
              </div>
              {statusDropdownOpen && (
                <div className="custom-select-options">
                  <div 
                    className={`custom-select-option ${status === 'active' ? 'selected' : ''}`} 
                    onClick={(e) => handleStatusChange('active', e)}
                  >
                    Active
                  </div>
                  <div 
                    className={`custom-select-option ${status === 'inactive' ? 'selected' : ''}`} 
                    onClick={(e) => handleStatusChange('inactive', e)}
                  >
                    Inactive
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-section middle-section">
          <div className="airport-details-group from-group">
            <h2>From</h2>
            <div className="form-group">
              <label htmlFor="fromAirport">Airport</label>
              <Select<AirportOptionType>
                inputId="fromAirport"
                options={airportOptions}
                isLoading={loadingAirports}
                value={airportOptions.find(option => option.value === fromInput.airport_id)}
                isDisabled={true}
                placeholder="Select From Airport..."
                styles={selectCustomStyles}
              />
            </div>
            <div className="form-group">
              <label htmlFor="fromCity">City</label>
              <input 
                type="text" 
                id="fromCity" 
                name="fromCity" 
                value={fromInput.city} 
                readOnly 
                disabled
                placeholder="City (auto-filled)" 
                className="disabled"
                style={{
                  backgroundColor: '#f5f5f5',
                  cursor: 'not-allowed',
                  opacity: 0.8
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="fromCountry">Country</label>
              <input 
                type="text" 
                id="fromCountry" 
                name="fromCountry" 
                value={fromInput.country} 
                readOnly 
                disabled
                placeholder="Country (auto-filled)"
                className="disabled"
                style={{
                  backgroundColor: '#f5f5f5',
                  cursor: 'not-allowed',
                  opacity: 0.8
                }}
              />
            </div>
          </div>

          <div className="map-preview">
            {mapFromAirport && mapToAirport && (
              <GlobeMap
                fromAirport={mapFromAirport}
                toAirport={mapToAirport}
              />
            )}
          </div>

          <div className="airport-details-group to-group">
            <h2>To</h2>
            <div className="form-group">
              <label htmlFor="toAirport">Airport</label>
              <Select<AirportOptionType>
                inputId="toAirport"
                options={airportOptions}
                isLoading={loadingAirports}
                value={airportOptions.find(option => option.value === toInput.airport_id)}
                isDisabled={true}
                placeholder="Select To Airport..."
                styles={selectCustomStyles}
              />
            </div>
            <div className="form-group">
              <label htmlFor="toCity">City</label>
              <input 
                type="text" 
                id="toCity" 
                name="toCity" 
                value={toInput.city} 
                readOnly 
                disabled
                placeholder="City (auto-filled)" 
                className="disabled"
                style={{
                  backgroundColor: '#f5f5f5',
                  cursor: 'not-allowed',
                  opacity: 0.8
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="toCountry">Country</label>
              <input 
                type="text" 
                id="toCountry" 
                name="toCountry" 
                value={toInput.country} 
                readOnly 
                disabled
                placeholder="Country (auto-filled)" 
                className="disabled"
                style={{
                  backgroundColor: '#f5f5f5',
                  cursor: 'not-allowed',
                  opacity: 0.8
                }}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-done" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'SAVE'}
          </button>
          <button 
            type="button" 
            className="btn btn-exit" 
            onClick={() => navigate('/admin/pathways/routes')}
            disabled={saving}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRoutePage; 