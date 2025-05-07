import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select, {
  SingleValue,
  StylesConfig,
  ControlProps,
  PlaceholderProps,
  SingleValueProps,
  GroupBase,
  ClearIndicatorProps,
} from 'react-select'; // Import React Select
import { FaPlane } from 'react-icons/fa'; // Assuming FaPlane is suitable
import './AddRoutePage.css';
import { getAirportList } from '../../../services/airportService'; // Import airport service
import { Airport } from '../../../types/airport'; // Import Airport type

interface AirportInputState {
  airport_id: number | null; // Store selected airport ID
  airport_name: string; // For display or if IATA is not enough
  iata_code: string; // Often used as a key
  city: string;
  country: string;
}

// Option type for React Select
interface AirportOptionType {
  value: number; // airport_id
  label: string; // e.g., "BKK - Suvarnabhumi Airport"
  airport: Airport; // Full airport object to access city/country
}

const AddRoutePage: React.FC = () => {
  const navigate = useNavigate();

  const [distance, setDistance] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(''); // Added seconds
  const [status, setStatus] = useState('active'); // Default status
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false); // New state for dropdown
  const [fromInput, setFromInput] = useState<AirportInputState>({ airport_id: null, airport_name: '', iata_code: '', city: '', country: '' });
  const [toInput, setToInput] = useState<AirportInputState>({ airport_id: null, airport_name: '', iata_code: '', city: '', country: '' });
  
  // State for airport list and fetching status
  const [airportOptions, setAirportOptions] = useState<AirportOptionType[]>([]);
  const [loadingAirports, setLoadingAirports] = useState(true);
  const [airportFetchError, setAirportFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAirportsAndSetOptions = async () => {
      setLoadingAirports(true);
      setAirportFetchError(null);
      try {
        const airportData = await getAirportList();
        const options = airportData.map(ap => ({
          value: ap.airport_id,
          label: `${ap.iata_code} - ${ap.name}`,
          airport: ap, // Store the full airport object
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
  }, []); // Empty dependency array to run once on mount

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

  const handleSimpleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case 'distance':
        // Allow only numbers and decimal point
        if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
          setDistance(value);
        }
        break;
      case 'status':
        setStatus(value);
        break;
      default:
        break;
    }
  };

  // Handle duration hours and minutes with validation
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Only allow numeric input
    if (value !== '' && !/^\d+$/.test(value)) {
      return;
    }
    
    if (name === 'durationHours') {
      // No specific upper limit for hours, but let's keep it reasonable (0-99)
      if (value === '' || parseInt(value) < 100) {
        setDurationHours(value);
      }
    } else if (name === 'durationMinutes') {
      // Minutes should be 0-59
      if (value === '' || (parseInt(value) >= 0 && parseInt(value) < 60)) {
        setDurationMinutes(value);
      }
    } else if (name === 'durationSeconds') { // Added seconds handling
      // Seconds should be 0-59
      if (value === '' || (parseInt(value) >= 0 && parseInt(value) < 60)) {
        setDurationSeconds(value);
      }
    }
  };
  
  const handleAirportSelectChange = (selectedOption: SingleValue<AirportOptionType>, type: 'from' | 'to') => {
    if (selectedOption) {
      const { airport } = selectedOption;
      const airportDetails: AirportInputState = {
        airport_id: airport.airport_id,
        airport_name: airport.name,
        iata_code: airport.iata_code,
        city: airport.city,
        country: airport.country,
      };
      if (type === 'from') {
        setFromInput(airportDetails);
      } else {
        setToInput(airportDetails);
      }
    } else {
      // Reset if cleared
      const emptyDetails: AirportInputState = { airport_id: null, airport_name: '', iata_code: '', city: '', country: '' };
      if (type === 'from') {
        setFromInput(emptyDetails);
      } else {
        setToInput(emptyDetails);
      }
    }
  };

  const handleStatusChange = (newStatus: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    setStatus(newStatus);
    setStatusDropdownOpen(false);
  };

  const toggleStatusDropdown = () => {
    setStatusDropdownOpen(!statusDropdownOpen);
  };

  const handleSubmit = () => {
    // Format the duration as "HH:MM:SS" for API submission
    const formattedHours = durationHours.padStart(2, '0');
    const formattedMinutes = durationMinutes.padStart(2, '0');
    const formattedSeconds = durationSeconds.padStart(2, '0'); // Added seconds formatting
    const formattedDuration = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`; // Updated format
    
    // Convert distance to number for API
    const numericDistance = distance ? parseFloat(distance) : 0;
    
    console.log('Submitting Route:', {
      distance: numericDistance,
      duration: formattedDuration, // Use the formatted duration string
      status,
      from_airport_id: fromInput.airport_id,
      to_airport_id: toInput.airport_id,
      // Include other details if your POST API expects them, e.g., full fromInput/toInput objects
    });
    // navigate('/admin/pathways/routes'); 
  };

  const handleExit = () => {
    navigate('/admin/pathways/routes');
  };

  // Custom styles for React Select to make it blend with existing form styles
  const selectCustomStyles: StylesConfig<AirportOptionType, false, GroupBase<AirportOptionType>> = {
    container: (provided) => ({
      ...provided,
      // Add styles to the outermost container
      boxShadow: 'none',
      outline: 'none',
      border: 'none',
      // This helps ensure no focus effects propagate to the container
      '& *': {
        boxShadow: 'none !important',
        outline: 'none !important',
      }
    }),
    control: (provided, state: ControlProps<AirportOptionType, false, GroupBase<AirportOptionType>>) => ({
      ...provided,
      minHeight: '42px',
      borderColor: state.isFocused ? '#adb5bd' : '#d1d9e0',
      boxShadow: 'none', // Ensures no default box-shadow, including focus
      outline: 'none', // Explicitly remove browser default outline
      '&:hover': {
        borderColor: state.isFocused ? '#adb5bd' : '#ced4da',
      },
      borderRadius: '8px',
      fontSize: '1em',
      backgroundColor: '#fff',
      // Add this to override any focus styles
      '&:focus, &:focus-within': {
        boxShadow: 'none',
        outline: 'none',
        border: '1px solid #d1d9e0',
      }
    }),
    valueContainer: (provided) => ({
      ...provided,
      boxShadow: 'none',
      outline: 'none',
      // Remove any borders or visual markers
      border: 'none',
      // Force override any potential focus indicators
      '&:focus, &:focus-within': {
        boxShadow: 'none !important',
        outline: 'none !important',
        border: 'none !important',
      },
      // If there's a left blue bar, try removing padding-left
      paddingLeft: '8px',
      // padding property from provided is important, ensure it's kept by spreading provided first
    }),
    placeholder: (
      provided, 
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      { isDisabled }: PlaceholderProps<AirportOptionType, false, GroupBase<AirportOptionType>>
    ) => ({
      ...provided,
      color: '#868e96',
      // Remove any styling that might contribute to the blue bar
      boxShadow: 'none',
      outline: 'none',
      border: 'none',
      // Adjust padding if needed
      padding: '0',
      margin: '0',
    }),
    singleValue: (
      provided, 
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      { isDisabled }: SingleValueProps<AirportOptionType, false, GroupBase<AirportOptionType>>
    ) => ({
      ...provided,
      color: '#495057',
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      marginTop: '4px',
      backgroundColor: '#fff',
    }),
    menuList: (provided) => ({
      ...provided,
      paddingTop: '4px',
      paddingBottom: '4px',
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: '0.95em',
      padding: '10px 14px',
      backgroundColor: state.isSelected
        ? '#007bff' 
        : state.isFocused
        ? '#e9ecef' 
        : '#fff',
      color: state.isSelected
        ? '#fff'
        : state.isFocused
        ? '#212529'
        : '#495057',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: state.isSelected ? '#007bff' : '#dde2e7', 
      },
    }),
    clearIndicator: (
      provided,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      state: ClearIndicatorProps<AirportOptionType, false, GroupBase<AirportOptionType>>
    ) => ({
      ...provided,
      color: '#adb5bd',
      padding: '8px',
      '&:hover': {
        color: '#495057',
      },
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      color: state.isFocused ? '#86b7fe' : '#ced4da', 
      padding: '8px', 
      '&:hover': {
        color: state.isFocused ? '#86b7fe' : '#495057',
      }
    }),
    noOptionsMessage: (provided) => ({
      ...provided,
      padding: '10px 14px',
      textAlign: 'center',
      color: '#6c757d',
    }),
    multiValueRemove: () => ({
      display: 'none',
    }),
    multiValue: (provided) => ({
        ...provided,
        // Ensure the input itself (when typing) doesn't get styled like a multi-value tag
        // These styles are more for actual multi-select tags, but good to have safe defaults
        backgroundColor: 'transparent', // Make it transparent if it shows up unwantedly
        border: 'none',
        padding: '0',
        margin: '0',
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        padding: '0', // Remove padding if it affects input value styling
        fontSize: '1em', // Match input font size
        color: '#495057', // Match input text color
    }),
    input: (provided) => ({
      ...provided,
      // Explicitly set text color and caret color to our desired value
      color: '#495057',
      caretColor: '#495057',
      // Ensure background is transparent
      background: 'transparent',
      // Ensure opacity is 1
      opacity: 1,
      // Reset margin and padding
      margin: '0px',
      padding: '0px',
      // Ensure no border or outline on the input element itself
      border: '0px',
      outline: '0px',
      // Explicitly remove any box-shadow from the input element
      boxShadow: 'none',
      // Target any focus styles or pseudo-elements that might add a blue bar
      '&:focus, &:focus-within, &::before, &::after': {
        boxShadow: 'none !important',
        outline: 'none !important',
        border: 'none !important',
      }
      // Other styles like width, gridArea, font, minWidth from 'provided' are generally fine
    }),
  };

  return (
    <div className="add-route-page">
      <div className="add-route-container">
        <h1 className="add-route-title">Add New Route</h1> {/* Changed from Routes ID for clarity */}
        
        {/* Consider adding loading/error state for airport data here */}
        {loadingAirports && <p>Loading airport data...</p>}
        {airportFetchError && <p style={{ color: 'red' }}>Error loading airports: {airportFetchError}</p>}

        <div className="form-section top-section">
          <div className="form-group">
            <label htmlFor="distance">Distance</label>
            <div className="distance-input-wrapper">
              <input 
                type="text" 
                id="distance" 
                name="distance" 
                value={distance} 
                onChange={handleSimpleInputChange} 
                placeholder="Enter distance number" 
                className="form-control-base"
                style={{
                  paddingRight: '45px'
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
                  onChange={handleDurationChange} 
                  placeholder="00"
                  maxLength={2}
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
                  onChange={handleDurationChange} 
                  placeholder="00"
                  maxLength={2}
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
                  onChange={handleDurationChange} 
                  placeholder="00"
                  maxLength={2}
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
                onChange={(option) => handleAirportSelectChange(option, 'from')}
                value={airportOptions.find(option => option.value === fromInput.airport_id)}
                isClearable
                placeholder="Select From Airport..."
                styles={selectCustomStyles}
                noOptionsMessage={() => loadingAirports ? 'Loading airports...' : 'No airports found'}
              />
            </div>
            <div className="form-group">
              <label htmlFor="fromCity">City</label>
              <input type="text" id="fromCity" name="fromCity" value={fromInput.city} readOnly placeholder="City (auto-filled)" />
            </div>
            <div className="form-group">
              <label htmlFor="fromCountry">Country</label>
              <input type="text" id="fromCountry" name="fromCountry" value={fromInput.country} readOnly placeholder="Country (auto-filled)"/>
            </div>
          </div>

          <div className="plane-icon-container">
            <FaPlane className="plane-icon" />
          </div>

          <div className="airport-details-group to-group">
            <h2>To</h2>
            <div className="form-group">
              <label htmlFor="toAirport">Airport</label>
              <Select<AirportOptionType>
                inputId="toAirport"
                options={airportOptions}
                isLoading={loadingAirports}
                onChange={(option) => handleAirportSelectChange(option, 'to')}
                value={airportOptions.find(option => option.value === toInput.airport_id)}
                isClearable
                placeholder="Select To Airport..."
                styles={selectCustomStyles}
                noOptionsMessage={() => loadingAirports ? 'Loading airports...' : 'No airports found'}
              />
            </div>
            <div className="form-group">
              <label htmlFor="toCity">City</label>
              <input type="text" id="toCity" name="toCity" value={toInput.city} readOnly placeholder="City (auto-filled)" />
            </div>
            <div className="form-group">
              <label htmlFor="toCountry">Country</label>
              <input type="text" id="toCountry" name="toCountry" value={toInput.country} readOnly placeholder="Country (auto-filled)" />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-done" onClick={handleSubmit}>DONE</button>
          <button type="button" className="btn btn-exit" onClick={handleExit}>EXIT</button>
        </div>
      </div>
    </div>
  );
};

export default AddRoutePage; 