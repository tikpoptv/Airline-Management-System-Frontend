import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select, { StylesConfig } from 'react-select';
import { Country, City } from 'country-state-city';
import moment from 'moment-timezone';
import { FaArrowLeft, FaCheckCircle, FaExclamationCircle, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { createAirport } from '../../../services/airportService';
import { CreateAirportRequest } from '../../../types/airport';
import './AddAirportPage.css';

// API interface ตามที่กำหนด
interface AirportRequest {
  iata_code: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  status: 'active' | 'inactive';
}

interface SelectOption {
  value: string;
  label: string;
}

// Status options
const STATUS_OPTIONS: SelectOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
];

// Custom styles สำหรับ react-select
const customSelectStyles: StylesConfig<SelectOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: '48px',
    background: '#f8f9fa',
    borderRadius: '8px',
    border: state.isFocused ? '1px solid #e2e8f0' : '1px solid #e2e8f0',
    boxShadow: 'none',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: '#cbd5e1'
    },
    '&:focus': {
      outline: 'none',
      boxShadow: 'none',
      border: '1px solid #e2e8f0'
    }
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected 
      ? '#3b82f6' 
      : state.isFocused 
        ? '#f1f5f9' 
        : 'transparent',
    color: state.isSelected ? 'white' : '#0f172a',
    padding: '10px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    ':active': {
      backgroundColor: '#3b82f6',
      color: 'white'
    }
  }),
  menu: (base) => ({
    ...base,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    overflow: 'hidden',
    zIndex: 10
  }),
  menuList: (base) => ({
    ...base,
    padding: '6px',
    maxHeight: '280px'
  }),
  valueContainer: (base) => ({
    ...base,
    outline: 'none'
  }),
  input: (base) => ({
    ...base,
    outline: 'none',
    boxShadow: 'none',
    '&:focus': {
      outline: 'none',
      boxShadow: 'none'
    }
  }),
  singleValue: (base) => ({
    ...base,
    outline: 'none'
  })
};

// Confirmation Modal Component
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  airportData: AirportRequest;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, airportData }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Confirm Airport Details</h2>
        <p>Please review the airport information before saving:</p>
        
        <div className="confirm-details">
          <div className="confirm-detail-item">
            <span className="confirm-label">IATA Code:</span>
            <span className="confirm-value">{airportData.iata_code}</span>
          </div>
          <div className="confirm-detail-item">
            <span className="confirm-label">Name:</span>
            <span className="confirm-value">{airportData.name}</span>
          </div>
          <div className="confirm-detail-item">
            <span className="confirm-label">City:</span>
            <span className="confirm-value">{airportData.city}</span>
          </div>
          <div className="confirm-detail-item">
            <span className="confirm-label">Country:</span>
            <span className="confirm-value">{airportData.country}</span>
          </div>
          <div className="confirm-detail-item">
            <span className="confirm-label">Coordinates:</span>
            <span className="confirm-value">
              {airportData.latitude}, {airportData.longitude}
            </span>
          </div>
          <div className="confirm-detail-item">
            <span className="confirm-label">Timezone:</span>
            <span className="confirm-value">{airportData.timezone}</span>
          </div>
          <div className="confirm-detail-item">
            <span className="confirm-label">Status:</span>
            <span className="confirm-value">{airportData.status === 'active' ? 'Active' : 'Inactive'}</span>
          </div>
        </div>

        <div className="modal-actions">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="confirm-button" onClick={onConfirm}>
            Confirm & Save
          </button>
        </div>
      </div>
    </div>
  );
};

interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
  message: string;
}

const AddAirportPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State for form fields
  const [iataCode, setIataCode] = useState('');
  const [name, setName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<SelectOption | null>(null);
  const [selectedCity, setSelectedCity] = useState<SelectOption | null>(null);
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [selectedTimezone, setSelectedTimezone] = useState<SelectOption | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<SelectOption | null>(STATUS_OPTIONS[0]);
  
  // State for validation and modals
  const [errors, setErrors] = useState<Partial<Record<keyof AirportRequest, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [airportToConfirm, setAirportToConfirm] = useState<CreateAirportRequest | null>(null);

  // New state for filtered options
  const [filteredTimezones, setFilteredTimezones] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Effect to update timezone based on country selection
  useEffect(() => {
    if (selectedCountry) {
      setIsLoading(true);
      
      // Get country information
      const countryInfo = Country.getCountryByCode(selectedCountry.value);
      
      if (countryInfo) {
        // Use the country name to filter timezones
        const countryName = countryInfo.name;
        
        // Filter timezones that might match the country
        const possibleTimezones = moment.tz.names().filter(tz => {
          // Check if timezone string contains the country name or code
          const containsCountry = tz.includes(countryName) || 
                                 tz.includes(selectedCountry.value) ||
                                 tz.includes(countryName.split(' ')[0]);
          
          return containsCountry;
        });
        
        // Map to select options
        const timezoneOptions = possibleTimezones.map(tz => ({
          value: tz,
          label: `${tz} (UTC${moment.tz(tz).format('Z')})`
        }));
        
        setFilteredTimezones(timezoneOptions.length > 0 ? timezoneOptions : getAllTimezones());
      } else {
        setFilteredTimezones(getAllTimezones());
      }
      
      setIsLoading(false);
    } else {
      setFilteredTimezones(getAllTimezones());
    }
  }, [selectedCountry]);

  // Get all country options
  const countryOptions: SelectOption[] = Country.getAllCountries().map(country => ({
    value: country.isoCode,
    label: `${country.name} (${country.isoCode})`
  }));

  // Get city options based on selected country
  const cityOptions: SelectOption[] = selectedCountry
    ? City.getCitiesOfCountry(selectedCountry.value)?.map(city => ({
        value: city.name,
        label: city.name
      })) || []
    : [];

  // Get all timezone options function
  function getAllTimezones(): SelectOption[] {
    return moment.tz.names().map(tz => ({
      value: tz,
      label: `${tz} (UTC${moment.tz(tz).format('Z')})`
    }));
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AirportRequest, string>> = {};

    if (!iataCode) {
      newErrors.iata_code = 'IATA code is required';
    } else if (!/^[A-Z]{3}$/.test(iataCode)) {
      newErrors.iata_code = 'IATA code must be 3 uppercase letters';
    }

    if (!name) {
      newErrors.name = 'Airport name is required';
    }

    if (!selectedCity) {
      newErrors.city = 'City is required';
    }

    if (!selectedCountry) {
      newErrors.country = 'Country is required';
    }

    if (latitude < -90 || latitude > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    if (longitude < -180 || longitude > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    if (!selectedTimezone) {
      newErrors.timezone = 'Timezone is required';
    }

    if (!selectedStatus) {
      newErrors.status = 'Status is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Show confirmation modal
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const airportData: CreateAirportRequest = {
      iata_code: iataCode,
      name: name,
      city: selectedCity?.value || '',
      country: selectedCountry?.value || '',
      latitude: latitude,
      longitude: longitude,
      timezone: selectedTimezone?.value || '',
      status: (selectedStatus?.value as 'active' | 'inactive') || 'active'
    };

    setAirportToConfirm(airportData);
    setShowConfirmModal(true);
  };

  // Handle actual API submission after confirmation
  const handleConfirmedSubmit = async () => {
    if (!airportToConfirm) return;
    
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError('');
    setShowConfirmModal(false);

    try {
      await createAirport(airportToConfirm);
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/admin/pathways/airport', { 
          state: { 
            notification: { 
              type: 'success', 
              message: 'Airport added successfully' 
            } 
          } 
        });
      }, 1500);
    } catch (error: unknown) {
      console.error('API Error:', error);
      const apiError = error as ApiError;
      if (apiError.response?.data?.message) {
        setSubmitError(apiError.response.data.message);
      } else if (apiError.response?.data?.error) {
        setSubmitError(apiError.response.data.error);
      } else if (apiError.message) {
        setSubmitError(apiError.message);
      } else {
        setSubmitError('Failed to create airport. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-airport-page">
      <div className="add-airport-header">
        <div className="add-airport-breadcrumb">
          <button className="back-button" onClick={() => navigate('/admin/pathways/airport')}>
            <FaArrowLeft />
          </button>
          <span>Airports</span>
          <span className="separator">/</span>
          <span>Add New Airport</span>
        </div>
        <h1>Add New Airport</h1>
      </div>

      {submitSuccess && (
        <div className="success-notification">
          <div className="success-icon"><FaCheckCircle /></div>
          <p>Airport added successfully! Redirecting...</p>
        </div>
      )}

      {submitError && (
        <div className="error-notification">
          <div className="error-icon"><FaExclamationCircle /></div>
          <p>{submitError}</p>
        </div>
      )}

      <form className="add-airport-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Airport Information</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>IATA Code*</label>
              <input
                type="text"
                value={iataCode}
                onChange={(e) => setIataCode(e.target.value.toUpperCase())}
                maxLength={3}
                placeholder="e.g. BKK"
              />
              {errors.iata_code && <span className="error-message">{errors.iata_code}</span>}
            </div>

            <div className="form-group">
              <label>Airport Name*</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Suvarnabhumi"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Country*</label>
              <Select
                styles={customSelectStyles}
                options={countryOptions}
                value={selectedCountry}
                onChange={(option) => {
                  setSelectedCountry(option);
                  setSelectedCity(null);
                  setSelectedTimezone(null);
                }}
                placeholder="Select country"
                isSearchable
                classNamePrefix="select"
              />
              {errors.country && <span className="error-message">{errors.country}</span>}
            </div>

            <div className="form-group">
              <label>City*</label>
              <Select
                styles={customSelectStyles}
                options={cityOptions}
                value={selectedCity}
                onChange={setSelectedCity}
                placeholder={selectedCountry ? "Select city" : "Select country first"}
                isDisabled={!selectedCountry}
                isSearchable
                classNamePrefix="select"
                noOptionsMessage={() => selectedCountry ? "No cities found" : "Select a country first"}
              />
              {errors.city && <span className="error-message">{errors.city}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Latitude*</label>
              <div className="input-with-icon">
                <FaMapMarkerAlt className="input-icon" />
                <input
                  type="number"
                  value={latitude || ''}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  step="0.0001"
                  placeholder="e.g. 13.6900"
                />
              </div>
              {errors.latitude && <span className="error-message">{errors.latitude}</span>}
            </div>

            <div className="form-group">
              <label>Longitude*</label>
              <div className="input-with-icon">
                <FaMapMarkerAlt className="input-icon" />
                <input
                  type="number"
                  value={longitude || ''}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  step="0.0001"
                  placeholder="e.g. 100.7501"
                />
              </div>
              {errors.longitude && <span className="error-message">{errors.longitude}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group timezone-group">
              <label>Timezone*</label>
              <div className="input-with-icon">
                <FaClock className="select-icon" />
                <Select
                  styles={customSelectStyles}
                  options={filteredTimezones}
                  value={selectedTimezone}
                  onChange={setSelectedTimezone}
                  placeholder="Select timezone"
                  isSearchable
                  classNamePrefix="select"
                  isLoading={isLoading}
                  className="timezone-select"
                />
              </div>
              {errors.timezone && <span className="error-message">{errors.timezone}</span>}
            </div>

            <div className="form-group">
              <label>Status*</label>
              <Select
                styles={customSelectStyles}
                options={STATUS_OPTIONS}
                value={selectedStatus}
                onChange={setSelectedStatus}
                placeholder="Select status"
                classNamePrefix="select"
              />
              {errors.status && <span className="error-message">{errors.status}</span>}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={() => navigate('/admin/pathways/airport')}>
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Airport'}
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && airportToConfirm && (
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmedSubmit}
          airportData={airportToConfirm}
        />
      )}
    </div>
  );
};

export default AddAirportPage; 