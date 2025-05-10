// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Select, {
//   SingleValue,
//   StylesConfig,
//   ControlProps,
//   PlaceholderProps,
//   SingleValueProps,
//   GroupBase,
//   ClearIndicatorProps,
// } from 'react-select'; // Import React Select
// import { FaPlane } from 'react-icons/fa'; // Assuming FaPlane is suitable
// import './AddRoutePage.css';
// import { getAirportList } from '../../../services/airportService'; // Import airport service
// import { Airport } from '../../../types/airport'; // Import Airport type
// import GlobeMapModal from './components/GlobeMapModal/GlobeMapModal';
// import GlobeMap, { Airport as GlobeAirport } from './components/GlobeMap/GlobeMap';
// import { addRoute, RouteCreateData } from '../../../services/route/routeService';

// interface AirportInputState {
//   airport_id: number | null; // Store selected airport ID
//   airport_name: string; // For display or if IATA is not enough
//   iata_code: string; // Often used as a key
//   city: string;
//   country: string;
// }

// // Option type for React Select
// interface AirportOptionType {
//   value: number; // airport_id
//   label: string; // e.g., "BKK - Suvarnabhumi Airport"
//   airport: Airport; // Full airport object to access city/country
// }

// const AddRoutePage: React.FC = () => {
//   const navigate = useNavigate();

//   const [distance, setDistance] = useState('');
//   const [durationHours, setDurationHours] = useState('');
//   const [durationMinutes, setDurationMinutes] = useState('');
//   const [durationSeconds, setDurationSeconds] = useState(''); // Added seconds
//   const [status, setStatus] = useState('active'); // Default status
//   const [statusDropdownOpen, setStatusDropdownOpen] = useState(false); // New state for dropdown
//   const [fromInput, setFromInput] = useState<AirportInputState>({ airport_id: null, airport_name: '', iata_code: '', city: '', country: '' });
//   const [toInput, setToInput] = useState<AirportInputState>({ airport_id: null, airport_name: '', iata_code: '', city: '', country: '' });
  
//   // State for airport list and fetching status
//   const [airportOptions, setAirportOptions] = useState<AirportOptionType[]>([]);
//   const [loadingAirports, setLoadingAirports] = useState(true);
//   const [airportFetchError, setAirportFetchError] = useState<string | null>(null);
  
//   // State for form validation and submission
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
//   // State for GlobeMap modal
//   const [showGlobeMap, setShowGlobeMap] = useState(false);
//   const [mapFromAirport, setMapFromAirport] = useState<GlobeAirport | null>(null);
//   const [mapToAirport, setMapToAirport] = useState<GlobeAirport | null>(null);
  
//   // State for confirmation and result modals
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [showResultModal, setShowResultModal] = useState(false);
//   const [apiResponse, setApiResponse] = useState<Record<string, unknown> | null>(null);
//   const [isSuccess, setIsSuccess] = useState(false);

//   useEffect(() => {
//     const fetchAirportsAndSetOptions = async () => {
//       setLoadingAirports(true);
//       setAirportFetchError(null);
//       try {
//         const airportData = await getAirportList();
//         const options = airportData.map(ap => ({
//           value: ap.airport_id,
//           label: `${ap.iata_code} - ${ap.name}`,
//           airport: ap, // Store the full airport object
//         }));
//         setAirportOptions(options);
//       } catch (error) {
//         console.error('Failed to load airports in component:', error);
//         setAirportFetchError(error instanceof Error ? error.message : 'Could not fetch airports.');
//       } finally {
//         setLoadingAirports(false);
//       }
//     };

//     fetchAirportsAndSetOptions();
//   }, []); // Empty dependency array to run once on mount

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       const target = event.target as HTMLElement;
//       if (!target.closest('.custom-select-wrapper')) {
//         setStatusDropdownOpen(false);
//       }
//     };
    
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   const handleSimpleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     switch (name) {
//       case 'distance':
//         // Allow only numbers and decimal point
//         if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
//           setDistance(value);
//         }
//         break;
//       case 'status':
//         setStatus(value);
//         break;
//       default:
//         break;
//     }
//   };

//   // Handle duration hours and minutes with validation
//   const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
    
//     // Only allow numeric input
//     if (value !== '' && !/^\d+$/.test(value)) {
//       return;
//     }
    
//     if (name === 'durationHours') {
//       // No specific upper limit for hours, but let's keep it reasonable (0-99)
//       if (value === '' || parseInt(value) < 100) {
//         setDurationHours(value);
//       }
//     } else if (name === 'durationMinutes') {
//       // Minutes should be 0-59
//       if (value === '' || (parseInt(value) >= 0 && parseInt(value) < 60)) {
//         setDurationMinutes(value);
//       }
//     } else if (name === 'durationSeconds') { // Added seconds handling
//       // Seconds should be 0-59
//       if (value === '' || (parseInt(value) >= 0 && parseInt(value) < 60)) {
//         setDurationSeconds(value);
//       }
//     }
//   };
  
//   const handleAirportSelectChange = (selectedOption: SingleValue<AirportOptionType>, type: 'from' | 'to') => {
//     if (selectedOption) {
//       const { airport } = selectedOption;
//       const airportDetails: AirportInputState = {
//         airport_id: airport.airport_id,
//         airport_name: airport.name,
//         iata_code: airport.iata_code,
//         city: airport.city,
//         country: airport.country,
//       };
//       if (type === 'from') {
//         setFromInput(airportDetails);
//       } else {
//         setToInput(airportDetails);
//       }
//     } else {
//       // Reset if cleared
//       const emptyDetails: AirportInputState = { airport_id: null, airport_name: '', iata_code: '', city: '', country: '' };
//       if (type === 'from') {
//         setFromInput(emptyDetails);
//       } else {
//         setToInput(emptyDetails);
//       }
//     }
//   };

//   const handleStatusChange = (newStatus: string, e: React.MouseEvent) => {
//     e.stopPropagation(); // Prevent event bubbling
//     setStatus(newStatus);
//     setStatusDropdownOpen(false);
//   };

//   const toggleStatusDropdown = () => {
//     setStatusDropdownOpen(!statusDropdownOpen);
//   };

//   const handleSubmit = () => {
//     // Reset validation errors
//     setValidationErrors([]);
    
//     // Validate required fields
//     const errors: string[] = [];
    
//     if (!distance || parseFloat(distance) <= 0) {
//       errors.push('Please specify a valid distance (must be greater than 0)');
//     }
    
//     // ตรวจสอบว่ามีการกรอกเวลาอย่างน้อย HH:MM
//     if (!durationHours || !durationMinutes) {
//       errors.push('Please specify travel duration (hours and minutes)');
//     }
    
//     if (!fromInput.airport_id) {
//       errors.push('Please select a departure airport');
//     }
    
//     if (!toInput.airport_id) {
//       errors.push('Please select an arrival airport');
//     }
    
//     if (fromInput.airport_id && toInput.airport_id && fromInput.airport_id === toInput.airport_id) {
//       errors.push('Departure and arrival airports must not be the same');
//     }
    
//     if (status !== 'active' && status !== 'inactive') {
//       errors.push('Invalid status (must be active or inactive)');
//     }
    
//     if (errors.length > 0) {
//       setValidationErrors(errors);
//       return;
//     }
    
//     // Prepare map data for route calculation page
//     prepareMapData();
    
//     // Show route calculation window instead of confirmation screen immediately
//     setShowGlobeMap(true);
//   };
  
//   // Separate map data preparation function to be called from multiple places
//   const prepareMapData = () => {
//     const fromAirport = airportOptions.find(opt => opt.value === fromInput.airport_id)?.airport;
//     const toAirport = airportOptions.find(opt => opt.value === toInput.airport_id)?.airport;
    
//     if (fromAirport?.latitude && fromAirport?.longitude && toAirport?.latitude && toAirport?.longitude) {
//       // Create map data
//       const fromAirportForMap: GlobeAirport = {
//         iata_code: fromInput.iata_code,
//         name: fromInput.airport_name,
//         lat: fromAirport.latitude,
//         lon: fromAirport.longitude,
//         city: fromInput.city,
//         country: fromInput.country
//       };

//       const toAirportForMap: GlobeAirport = {
//         iata_code: toInput.iata_code,
//         name: toInput.airport_name,
//         lat: toAirport.latitude,
//         lon: toAirport.longitude,
//         city: toInput.city,
//         country: toInput.country
//       };
      
//       setMapFromAirport(fromAirportForMap);
//       setMapToAirport(toAirportForMap);
//       return true;
//     }
    
//     return false;
//   };

//   const handleConfirmSubmit = async () => {
//     setShowConfirmModal(false);
//     setIsSubmitting(true);
    
//     // Format the duration as "HH:mm:ss" for API submission
//     const formattedHours = (durationHours || '0').padStart(2, '0');
//     const formattedMinutes = (durationMinutes || '0').padStart(2, '0');
//     const formattedSeconds = (durationSeconds || '0').padStart(2, '0');
//     const formattedDuration = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    
//     // Convert distance to number for API
//     const numericDistance = distance ? parseFloat(distance) : 0;
    
//     if (!fromInput.airport_id || !toInput.airport_id) {
//       return; // Safety check
//     }
    
//     const routeData: RouteCreateData = {
//       distance: numericDistance,
//       estimated_duration: formattedDuration,
//       status,
//       from_airport_id: fromInput.airport_id,
//       to_airport_id: toInput.airport_id,
//     };
    
//     try {
//       const response = await addRoute(routeData);
//       console.log('Route created successfully:', response);
      
//       // Set success state and response data
//       setApiResponse(response as unknown as Record<string, unknown>);
//       setIsSuccess(true);
      
//       // Show result modal
//       setShowResultModal(true);
//     } catch (error) {
//       console.error('Failed to add route:', error);
      
//       // Set error state and response data
//       let errorMessage = 'An error occurred while saving data. Please try again.';
//       let errorData = null;
      
//       if (error instanceof Error) {
//         errorMessage = error.message || errorMessage;
//         errorData = { error: error.message };
//       }
      
//       setApiResponse(errorData || { error: errorMessage });
//       setIsSuccess(false);
      
//       // Show result modal for error
//       setShowResultModal(true);
      
//       // Also set validation errors to show on the form
//       setValidationErrors([errorMessage]);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleResultClose = () => {
//     setShowResultModal(false);
    
//     // If successful, navigate to routes page
//     if (isSuccess) {
//       navigate('/admin/pathways/routes');
//     }
//   };

//   // GlobeMap modal functions
//   const openGlobeMap = () => {
//     if (!fromInput.airport_id || !toInput.airport_id) {
//       // Notify user to select airports before viewing map
//       setValidationErrors(['Please select departure and arrival airports before viewing the map']);
//       return;
//     }
    
//     // Use the map data preparation function
//     if (!prepareMapData()) {
//       setValidationErrors(['Error: Airport coordinate data not found. Please contact system administrator']);
//       return;
//     }
    
//     // Show map
//     setShowGlobeMap(true);
//   };

//   // Function for when Proceed is clicked from route calculation page
//   const handleProceedFromMap = () => {
//     // Close map window
//     setShowGlobeMap(false);
//     // Show confirmation screen
//     setShowConfirmModal(true);
//   };

//   const closeGlobeMap = () => {
//     setShowGlobeMap(false);
//   };

//   const handleCalculateDistance = (calculatedDistance: number) => {
//     setDistance(calculatedDistance.toString());
    
//     // Estimate duration based on distance
//     // Assuming an average speed of 850 km/h
//     const speed = 850; // km/h
//     const timeHours = calculatedDistance / speed;
    
//     const hours = Math.floor(timeHours);
//     const minutes = Math.floor((timeHours - hours) * 60);
//     const seconds = Math.floor(((timeHours - hours) * 60 - minutes) * 60);
    
//     setDurationHours(hours.toString());
//     setDurationMinutes(minutes.toString());
//     setDurationSeconds(seconds.toString());
    
//     closeGlobeMap();
//   };

//   // Custom styles for React Select to make it blend with existing form styles
//   const selectCustomStyles: StylesConfig<AirportOptionType, false, GroupBase<AirportOptionType>> = {
//     container: (provided) => ({
//       ...provided,
//       // Add styles to the outermost container
//       boxShadow: 'none',
//       outline: 'none',
//       border: 'none',
//       // This helps ensure no focus effects propagate to the container
//       '& *': {
//         boxShadow: 'none !important',
//         outline: 'none !important',
//       }
//     }),
//     control: (provided, state: ControlProps<AirportOptionType, false, GroupBase<AirportOptionType>>) => ({
//       ...provided,
//       minHeight: '42px',
//       borderColor: state.isFocused ? '#adb5bd' : '#d1d9e0',
//       boxShadow: 'none', // Ensures no default box-shadow, including focus
//       outline: 'none', // Explicitly remove browser default outline
//       '&:hover': {
//         borderColor: state.isFocused ? '#adb5bd' : '#ced4da',
//       },
//       borderRadius: '8px',
//       fontSize: '1em',
//       backgroundColor: '#fff',
//       // Add this to override any focus styles
//       '&:focus, &:focus-within': {
//         boxShadow: 'none',
//         outline: 'none',
//         border: '1px solid #d1d9e0',
//       }
//     }),
//     valueContainer: (provided) => ({
//       ...provided,
//       boxShadow: 'none',
//       outline: 'none',
//       // Remove any borders or visual markers
//       border: 'none',
//       // Force override any potential focus indicators
//       '&:focus, &:focus-within': {
//         boxShadow: 'none !important',
//         outline: 'none !important',
//         border: 'none !important',
//       },
//       // If there's a left blue bar, try removing padding-left
//       paddingLeft: '8px',
//       // padding property from provided is important, ensure it's kept by spreading provided first
//     }),
//     placeholder: (
//       provided, 
//       // eslint-disable-next-line @typescript-eslint/no-unused-vars
//       { isDisabled }: PlaceholderProps<AirportOptionType, false, GroupBase<AirportOptionType>>
//     ) => ({
//       ...provided,
//       color: '#868e96',
//       // Remove any styling that might contribute to the blue bar
//       boxShadow: 'none',
//       outline: 'none',
//       border: 'none',
//       // Adjust padding if needed
//       padding: '0',
//       margin: '0',
//     }),
//     singleValue: (
//       provided, 
//       // eslint-disable-next-line @typescript-eslint/no-unused-vars
//       { isDisabled }: SingleValueProps<AirportOptionType, false, GroupBase<AirportOptionType>>
//     ) => ({
//       ...provided,
//       color: '#495057',
//     }),
//     menu: (provided) => ({
//       ...provided,
//       borderRadius: '8px',
//       boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
//       marginTop: '4px',
//       backgroundColor: '#fff',
//     }),
//     menuList: (provided) => ({
//       ...provided,
//       paddingTop: '4px',
//       paddingBottom: '4px',
//     }),
//     option: (provided, state) => ({
//       ...provided,
//       fontSize: '0.95em',
//       padding: '10px 14px',
//       backgroundColor: state.isSelected
//         ? '#007bff' 
//         : state.isFocused
//         ? '#e9ecef' 
//         : '#fff',
//       color: state.isSelected
//         ? '#fff'
//         : state.isFocused
//         ? '#212529'
//         : '#495057',
//       cursor: 'pointer',
//       '&:active': {
//         backgroundColor: state.isSelected ? '#007bff' : '#dde2e7', 
//       },
//     }),
//     clearIndicator: (
//       provided,
//       // eslint-disable-next-line @typescript-eslint/no-unused-vars
//       state: ClearIndicatorProps<AirportOptionType, false, GroupBase<AirportOptionType>>
//     ) => ({
//       ...provided,
//       color: '#adb5bd',
//       padding: '8px',
//       '&:hover': {
//         color: '#495057',
//       },
//     }),
//     indicatorSeparator: () => ({
//       display: 'none',
//     }),
//     dropdownIndicator: (provided, state) => ({
//       ...provided,
//       color: state.isFocused ? '#86b7fe' : '#ced4da', 
//       padding: '8px', 
//       '&:hover': {
//         color: state.isFocused ? '#86b7fe' : '#495057',
//       }
//     }),
//     noOptionsMessage: (provided) => ({
//       ...provided,
//       padding: '10px 14px',
//       textAlign: 'center',
//       color: '#6c757d',
//     }),
//     multiValueRemove: () => ({
//       display: 'none',
//     }),
//     multiValue: (provided) => ({
//         ...provided,
//         // Ensure the input itself (when typing) doesn't get styled like a multi-value tag
//         // These styles are more for actual multi-select tags, but good to have safe defaults
//         backgroundColor: 'transparent', // Make it transparent if it shows up unwantedly
//         border: 'none',
//         padding: '0',
//         margin: '0',
//     }),
//     multiValueLabel: (provided) => ({
//         ...provided,
//         padding: '0', // Remove padding if it affects input value styling
//         fontSize: '1em', // Match input font size
//         color: '#495057', // Match input text color
//     }),
//     input: (provided) => ({
//       ...provided,
//       // Explicitly set text color and caret color to our desired value
//       color: '#495057',
//       caretColor: '#495057',
//       // Ensure background is transparent
//       background: 'transparent',
//       // Ensure opacity is 1
//       opacity: 1,
//       // Reset margin and padding
//       margin: '0px',
//       padding: '0px',
//       // Ensure no border or outline on the input element itself
//       border: '0px',
//       outline: '0px',
//       // Explicitly remove any box-shadow from the input element
//       boxShadow: 'none',
//       // Target any focus styles or pseudo-elements that might add a blue bar
//       '&:focus, &:focus-within, &::before, &::after': {
//         boxShadow: 'none !important',
//         outline: 'none !important',
//         border: 'none !important',
//       }
//       // Other styles like width, gridArea, font, minWidth from 'provided' are generally fine
//     }),
//   };

//   // ConfirmModal Component
//   interface ConfirmModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     onConfirm: () => void;
//     routeData: {
//       fromAirport: string;
//       toAirport: string;
//       distance: string;
//       duration: string;
//       status: string;
//     };
//     fromAirportMap: GlobeAirport | null;
//     toAirportMap: GlobeAirport | null;
//   }

//   const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
//     isOpen, 
//     onClose, 
//     onConfirm, 
//     routeData,
//     fromAirportMap,
//     toAirportMap
//   }) => {
//     if (!isOpen) return null;

//     return (
//       <div className="modal-overlay">
//         <div className="modal-container confirm-container">
//           <div className="modal-header">
//             <h3>Confirm New Route Creation</h3>
//             <button className="modal-close" onClick={onClose}>&times;</button>
//           </div>
//           <div className="modal-body">
//             <p>Do you want to create a flight route with the following details?</p>
            
//             {/* Display GlobeMap when both airports have data */}
//             {fromAirportMap && toAirportMap && (
//               <div className="confirm-globe-map">
//                 <GlobeMap 
//                   fromAirport={fromAirportMap}
//                   toAirport={toAirportMap}
//                 />
//               </div>
//             )}
            
//             <div className="confirm-details">
//               <div className="confirm-detail-item">
//                 <span className="confirm-label">Departure Airport:</span>
//                 <span className="confirm-value">{routeData.fromAirport}</span>
//               </div>
//               <div className="confirm-detail-item">
//                 <span className="confirm-label">Arrival Airport:</span>
//                 <span className="confirm-value">{routeData.toAirport}</span>
//               </div>
//               <div className="confirm-detail-item">
//                 <span className="confirm-label">Distance:</span>
//                 <span className="confirm-value">{routeData.distance} km</span>
//               </div>
//               <div className="confirm-detail-item">
//                 <span className="confirm-label">Duration:</span>
//                 <span className="confirm-value">{routeData.duration}</span>
//               </div>
//               <div className="confirm-detail-item">
//                 <span className="confirm-label">Status:</span>
//                 <span className="confirm-value">{routeData.status === 'active' ? 'Active' : 'Inactive'}</span>
//               </div>
//             </div>
//           </div>
//           <div className="modal-footer">
//             <button className="btn btn-confirm" onClick={onConfirm}>Confirm</button>
//             <button className="btn btn-cancel" onClick={onClose}>Cancel</button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // ResultModal Component
//   interface ResultModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     isSuccess: boolean;
//     responseData?: Record<string, unknown> | null;
//   }

//   const ResultModal: React.FC<ResultModalProps> = ({ isOpen, onClose, isSuccess, responseData }) => {
//     if (!isOpen) return null;

//     return (
//       <div className="modal-overlay">
//         <div className="modal-container">
//           <div className="modal-header">
//             <h3>{isSuccess ? 'Operation Successful' : 'Error Occurred'}</h3>
//             <button className="modal-close" onClick={onClose}>&times;</button>
//           </div>
//           <div className="modal-body">
//             {isSuccess ? (
//               <>
//                 <div className="success-icon">✓</div>
//                 <p>Flight route created successfully!</p>
                
//                 {responseData && (
//                   <div className="response-data">
//                     <h4>Created Route Details:</h4>
//                     <pre>{JSON.stringify(responseData, null, 2)}</pre>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <>
//                 <div className="error-icon">✗</div>
//                 <p>An error occurred while creating the flight route</p>
                
//                 {responseData && (
//                   <div className="response-data error">
//                     <h4>Error Details:</h4>
//                     <pre>{JSON.stringify(responseData, null, 2)}</pre>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//           <div className="modal-footer">
//             <button 
//               className="btn btn-primary" 
//               onClick={onClose}
//             >
//               {isSuccess ? 'Go to Routes List' : 'Try Again'}
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="add-route-page">
//       <div className="add-route-container">
//         <h1 className="add-route-title">Add New Route</h1> {/* Changed from Routes ID for clarity */}
        
//         {/* Consider adding loading/error state for airport data here */}
//         {loadingAirports && <p>Loading airport data...</p>}
//         {airportFetchError && <p style={{ color: 'red' }}>Error loading airports: {airportFetchError}</p>}
        
//         {/* Display validation errors */}
//         {validationErrors.length > 0 && (
//           <div className="validation-errors" style={{
//             backgroundColor: '#fff8f8',
//             border: '1px solid #f5c6cb',
//             borderRadius: '8px',
//             padding: '15px',
//             marginBottom: '20px',
//             boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
//           }}>
//             <p style={{ 
//               color: '#cc0033', 
//               fontWeight: 'bold', 
//               marginBottom: '10px',
//               fontSize: '1rem'
//             }}>Please fix the following errors:</p>
//             <ul style={{ 
//               marginLeft: '20px', 
//               color: '#cc0033'
//             }}>
//               {validationErrors.map((error, index) => (
//                 <li key={index} style={{ marginBottom: '5px' }}>{error}</li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {/* Show loading state during submission */}
//         {isSubmitting && (
//           <div style={{
//             backgroundColor: '#e8f4ff',
//             border: '1px solid #b8daff',
//             borderRadius: '8px',
//             padding: '15px',
//             marginBottom: '20px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             columnGap: '10px'
//           }}>
//             <div style={{ 
//               width: '20px', 
//               height: '20px', 
//               border: '3px solid #0077e6',
//               borderTop: '3px solid transparent',
//               borderRadius: '50%',
//               animation: 'spin 1s linear infinite'
//             }} />
//             <p style={{ color: '#0077e6', margin: 0 }}>Saving route data...</p>
//           </div>
//         )}
          
//         {/* Add animation keyframes to the page's style */}
//         <style>{`
//           @keyframes spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//           }
//         `}</style>

//         <div className="form-section top-section">
//           <div className="form-group">
//             <label htmlFor="distance">Distance</label>
//             <div className="distance-input-wrapper">
//               <input 
//                 type="text" 
//                 id="distance" 
//                 name="distance" 
//                 value={distance} 
//                 onChange={handleSimpleInputChange} 
//                 placeholder="Enter distance number" 
//                 className="form-control-base"
//                 style={{
//                   paddingRight: '45px'
//                 }}
//               />
//               <span className="distance-unit">km</span>
//             </div>
//           </div>
//           <div className="form-group duration-group">
//             <label>Duration</label>
//             <div className="duration-inputs">
//               <div className="duration-input-container">
//                 <input 
//                   type="text" 
//                   id="durationHours" 
//                   name="durationHours" 
//                   value={durationHours}
//                   onChange={handleDurationChange} 
//                   placeholder="00"
//                   maxLength={2}
//                 />
//                 <span className="duration-label">Hours</span>
//               </div>
//               <span className="duration-separator">:</span>
//               <div className="duration-input-container">
//                 <input 
//                   type="text" 
//                   id="durationMinutes" 
//                   name="durationMinutes" 
//                   value={durationMinutes}
//                   onChange={handleDurationChange} 
//                   placeholder="00"
//                   maxLength={2}
//                 />
//                 <span className="duration-label">Minutes</span>
//               </div>
//               <span className="duration-separator">:</span>
//               <div className="duration-input-container">
//                 <input 
//                   type="text" 
//                   id="durationSeconds" 
//                   name="durationSeconds" 
//                   value={durationSeconds}
//                   onChange={handleDurationChange} 
//                   placeholder="00"
//                   maxLength={2}
//                 />
//                 <span className="duration-label">Seconds</span>
//               </div>
//             </div>
//           </div>
//           <div className="form-group status-group">
//             <label htmlFor="status">STATUS</label>
//             <div 
//               className="custom-select-wrapper" 
//               onClick={toggleStatusDropdown}
//             >
//               <div className="custom-select-selected">
//                 {status === 'active' ? 'Active' : 'Inactive'}
//                 <span className="custom-select-arrow"></span>
//               </div>
//               {statusDropdownOpen && (
//                 <div className="custom-select-options">
//                   <div 
//                     className={`custom-select-option ${status === 'active' ? 'selected' : ''}`} 
//                     onClick={(e) => handleStatusChange('active', e)}
//                   >
//                     Active
//                   </div>
//                   <div 
//                     className={`custom-select-option ${status === 'inactive' ? 'selected' : ''}`} 
//                     onClick={(e) => handleStatusChange('inactive', e)}
//                   >
//                     Inactive
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         <div className="form-section middle-section">
//           <div className="airport-details-group from-group">
//             <h2>From</h2>
//             <div className="form-group">
//               <label htmlFor="fromAirport">Airport</label>
//               <Select<AirportOptionType>
//                 inputId="fromAirport"
//                 options={airportOptions}
//                 isLoading={loadingAirports}
//                 onChange={(option) => handleAirportSelectChange(option, 'from')}
//                 value={airportOptions.find(option => option.value === fromInput.airport_id)}
//                 isClearable
//                 placeholder="Select From Airport..."
//                 styles={selectCustomStyles}
//                 noOptionsMessage={() => loadingAirports ? 'Loading airports...' : 'No airports found'}
//               />
//             </div>
//             <div className="form-group">
//               <label htmlFor="fromCity">City</label>
//               <input type="text" id="fromCity" name="fromCity" value={fromInput.city} readOnly placeholder="City (auto-filled)" />
//             </div>
//             <div className="form-group">
//               <label htmlFor="fromCountry">Country</label>
//               <input type="text" id="fromCountry" name="fromCountry" value={fromInput.country} readOnly placeholder="Country (auto-filled)"/>
//             </div>
//           </div>

//           <div className="plane-icon-container" onClick={openGlobeMap} style={{cursor: 'pointer'}}>
//             <FaPlane className="plane-icon" />
//             <div className="plane-icon-tooltip">Click to view map and calculate distance/time automatically</div>
//           </div>

//           <div className="airport-details-group to-group">
//             <h2>To</h2>
//             <div className="form-group">
//               <label htmlFor="toAirport">Airport</label>
//               <Select<AirportOptionType>
//                 inputId="toAirport"
//                 options={airportOptions}
//                 isLoading={loadingAirports}
//                 onChange={(option) => handleAirportSelectChange(option, 'to')}
//                 value={airportOptions.find(option => option.value === toInput.airport_id)}
//                 isClearable
//                 placeholder="Select To Airport..."
//                 styles={selectCustomStyles}
//                 noOptionsMessage={() => loadingAirports ? 'Loading airports...' : 'No airports found'}
//               />
//             </div>
//             <div className="form-group">
//               <label htmlFor="toCity">City</label>
//               <input type="text" id="toCity" name="toCity" value={toInput.city} readOnly placeholder="City (auto-filled)" />
//             </div>
//             <div className="form-group">
//               <label htmlFor="toCountry">Country</label>
//               <input type="text" id="toCountry" name="toCountry" value={toInput.country} readOnly placeholder="Country (auto-filled)" />
//             </div>
//           </div>
//         </div>

//         <div className="form-actions">
//           <button 
//             type="button" 
//             className="btn btn-done" 
//             onClick={handleSubmit}
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? 'กำลังบันทึก...' : 'DONE'}
//           </button>
//           <button 
//             type="button" 
//             className="btn btn-exit" 
//             onClick={() => navigate('/admin/pathways/routes')}
//             disabled={isSubmitting}
//           >
//             EXIT
//           </button>
//         </div>

//         {/* Add GlobeMapModal component */}
//         <GlobeMapModal
//           isOpen={showGlobeMap}
//           onClose={closeGlobeMap}
//           fromAirport={mapFromAirport}
//           toAirport={mapToAirport}
//           onCalculateDistance={handleCalculateDistance}
//           onProceed={handleProceedFromMap}
//           isRoutePlanning={true}
//           manualDistance={distance}
//           manualDuration={{
//             hours: durationHours || '0',
//             minutes: durationMinutes || '0',
//             seconds: durationSeconds || '0'
//           }}
//         />

//         {/* Add ConfirmModal component */}
//         <ConfirmModal
//           isOpen={showConfirmModal}
//           onClose={() => setShowConfirmModal(false)}
//           onConfirm={handleConfirmSubmit}
//           routeData={{
//             fromAirport: fromInput.airport_id 
//               ? `${fromInput.iata_code} - ${fromInput.airport_name} (${fromInput.city}, ${fromInput.country})` 
//               : '',
//             toAirport: toInput.airport_id 
//               ? `${toInput.iata_code} - ${toInput.airport_name} (${toInput.city}, ${toInput.country})` 
//               : '',
//             distance: distance,
//             duration: `${(durationHours || '0').padStart(2, '0')}:${(durationMinutes || '0').padStart(2, '0')}:${(durationSeconds || '0').padStart(2, '0')}`,
//             status: status,
//           }}
//           fromAirportMap={mapFromAirport}
//           toAirportMap={mapToAirport}
//         />

//         {/* Add ResultModal component */}
//         <ResultModal
//           isOpen={showResultModal}
//           onClose={handleResultClose}
//           isSuccess={isSuccess}
//           responseData={apiResponse}
//         />
//       </div>
//     </div>
//   );
// };

// export default AddRoutePage; 