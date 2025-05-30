import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Aircraft, AircraftModel, AirlineModel } from '../../../types/aircraft';
import { createAircraft, getAircraftModels, getAirlineModels } from '../../../services/aircraft/aircraftService';
import { FaArrowLeft, FaCheckCircle, FaExclamationCircle, FaCloudUploadAlt, FaTimes, FaChevronDown } from 'react-icons/fa';
import uploadPlaceholder from '../../../assets/images/upload.png';
import './CreateAircraftPage.css';

// Custom Dropdown Component
const CustomDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  error,
  isRequired
}: { 
  options: {id: string|number; value: string; label: string}[]; 
  value: string; 
  onChange: (value: string) => void; 
  placeholder: string;
  error?: string;
  isRequired?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update selected label when value changes
    const option = options.find(opt => opt.value === value);
    setSelectedLabel(option ? option.label : "");
  }, [value, options]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`custom-dropdown ${error ? 'error' : ''}`} ref={dropdownRef}>
      <div 
        className={`dropdown-selection ${!value ? 'placeholder' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {value ? selectedLabel : placeholder}
        <FaChevronDown className={`dropdown-arrow ${isOpen ? 'open' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="dropdown-options">
          {options.map((option) => (
            <div 
              key={option.id} 
              className={`dropdown-option ${option.value === value ? 'selected' : ''}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
      
      {error && (
        <span className="error-message">
          <FaExclamationCircle />
          {error}
        </span>
      )}
    </div>
  );
};

const CreateAircraftPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Omit<Aircraft, 'aircraft_id'>>({
    model: '',
    manufacture_year: new Date().getFullYear(),
    capacity: 0,
    airline_owner: '',
    maintenance_status: 'Operational',
    aircraft_history: '',
  });

  const [modelOptions, setModelOptions] = useState<AircraftModel[]>([]);
  const [airlineOptions, setAirlineOptions] = useState<AirlineModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // New state for image handling
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
  };

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const [models, airlines] = await Promise.all([
        getAircraftModels(),
        getAirlineModels(),
      ]);
      setModelOptions(models);
      setAirlineOptions(airlines);
    } catch (error) {
      console.error('Failed to fetch options:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const currentYear = new Date().getFullYear();

    if (!formData.model) newErrors.model = 'Please select a model';
    if (!formData.airline_owner) newErrors.airline_owner = 'Please select an airline';
    if (!formData.maintenance_status) newErrors.maintenance_status = 'Please select maintenance status';
    if (formData.capacity <= 0) newErrors.capacity = 'Capacity must be greater than 0';
    if (formData.manufacture_year < 1950 || formData.manufacture_year > currentYear) {
      newErrors.manufacture_year = `Manufacture year must be between 1950 and ${currentYear}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    setShowConfirmModal(true);
  };

  const handleConfirmCreate = async () => {
    setSaving(true);
    setShowConfirmModal(false);

    try {
      await createAircraft(formData);
      
      showToast('Aircraft created successfully! Redirecting...', 'success');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/admin/aircrafts', { 
        state: { 
          notification: {
            type: 'success',
            message: 'New aircraft has been created successfully.'
          }
        }
      });

    } catch (error) {
      console.error('Error creating aircraft:', error);
      
      let errorMessage = 'Unable to create aircraft. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = `Failed to create aircraft: ${error.message}`;
      }
      
      showToast(errorMessage, 'error');
      
      setTimeout(() => {
        setShowConfirmModal(true);
      }, 100);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Operational':
        return 'status-badge operational';
      case 'In Maintenance':
        return 'status-badge maintenance';
      case 'Retired':
        return 'status-badge retired';
      default:
        return 'status-badge';
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        showToast('Please select an image file', 'error');
      }
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      showToast('Please drop an image file', 'error');
    }
  }, []);

  const removeImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImage(null);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="content-container">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <span>Aircraft</span>
            <span className="breadcrumb-separator">›</span>
            <span>Create New</span>
          </div>
          <h1 className="page-title">Create New Aircraft</h1>
        </div>
        <button className="back-button" onClick={() => navigate('/admin/aircrafts')}>
          <FaArrowLeft /> Back to List
        </button>
      </div>

      <h2 className="section-title">Aircraft Profile</h2>

      <div className="profile-form">
        <div className="form-layout">
          {/* Aircraft Image Upload */}
          <div 
            className={`aircraft-image ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedImage ? (
              <>
                <img src={selectedImage} alt="Selected aircraft" />
                <button className="remove-image" onClick={removeImage}>
                  <FaTimes />
                </button>
              </>
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  title=""
                />
                <img src={uploadPlaceholder} alt="Upload placeholder" className="placeholder-image" />
                <div className="upload-overlay">
                  <FaCloudUploadAlt className="upload-icon" />
                  <span className="upload-text">
                    Click to upload or drag and drop
                    <br />
                    your aircraft image here
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Form Fields */}
          <div className="form-fields">
            <div className="form-row">
              <div className="form-group">
                <label>Model Name</label>
                <CustomDropdown
                  options={modelOptions.map(model => ({
                    id: model.model_id,
                    value: model.model_name,
                    label: model.model_name
                  }))}
                  value={formData.model}
                  onChange={(value) => setFormData({ ...formData, model: value })}
                  placeholder="Select Model"
                  error={errors.model}
                  isRequired
                />
              </div>

              <div className="form-group">
                <label>Airline Owner</label>
                <CustomDropdown
                  options={airlineOptions.map(airline => ({
                    id: airline.id,
                    value: airline.name,
                    label: airline.name
                  }))}
                  value={formData.airline_owner}
                  onChange={(value) => setFormData({ ...formData, airline_owner: value })}
                  placeholder="Select Airline"
                  error={errors.airline_owner}
                  isRequired
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Maintenance Status</label>
                <CustomDropdown
                  options={[
                    { id: 1, value: 'Operational', label: 'Operational' },
                    { id: 2, value: 'In Maintenance', label: 'In Maintenance' },
                    { id: 3, value: 'Retired', label: 'Retired' }
                  ]}
                  value={formData.maintenance_status}
                  onChange={(value) => setFormData({ 
                    ...formData, 
                    maintenance_status: value as Aircraft['maintenance_status'] 
                  })}
                  placeholder="Select Status"
                  error={errors.maintenance_status}
                  isRequired
                />
              </div>

              <div className="form-group">
                <label>Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  className={errors.capacity ? 'error' : ''}
                  placeholder="Enter aircraft capacity"
                />
                {errors.capacity && (
                  <span className="error-message">
                    <FaExclamationCircle />
                    {errors.capacity}
                  </span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Manufacture Year</label>
                <input
                  type="number"
                  value={formData.manufacture_year}
                  onChange={(e) => setFormData({ ...formData, manufacture_year: Number(e.target.value) })}
                  className={errors.manufacture_year ? 'error' : ''}
                  placeholder="Enter manufacture year"
                />
                {errors.manufacture_year && (
                  <span className="error-message">
                    <FaExclamationCircle />
                    {errors.manufacture_year}
                  </span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Aircraft History</label>
                <textarea
                  value={formData.aircraft_history}
                  onChange={(e) => setFormData({ ...formData, aircraft_history: e.target.value })}
                  rows={6}
                  placeholder="Enter aircraft history and notes..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button
          className="create-button"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <>Creating...</>
          ) : (
            <>Create Aircraft</>
          )}
        </button>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>Confirm Create Aircraft</h2>
            <p>Are you sure you want to create this aircraft with the following details?</p>
            
            <div className="modal-details">
              <div className="detail-row">
                <strong>Model:</strong> {formData.model}
              </div>
              <div className="detail-row">
                <strong>Airline Owner:</strong> {formData.airline_owner}
              </div>
              <div className="detail-row status">
                <strong>Maintenance Status:</strong> 
                <span className={getStatusBadgeClass(formData.maintenance_status)}>
                  {formData.maintenance_status}
                </span>
              </div>
              <div className="detail-row">
                <strong>Capacity:</strong> {formData.capacity}
              </div>
              <div className="detail-row">
                <strong>Manufacture Year:</strong> {formData.manufacture_year}
              </div>
              <div className="detail-row">
                <strong>Aircraft History:</strong> 
                <span className="history-text">
                  {formData.aircraft_history || '-'}
                </span>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="confirm-button" 
                onClick={handleConfirmCreate}
                disabled={saving}
              >
                {saving ? 'Creating...' : 'Confirm'}
              </button>
              <button 
                className="cancel-button"
                onClick={() => setShowConfirmModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Popup */}
      {toast.show && (
        <div className={`notification-popup ${toast.type} ${toast.show ? 'show' : 'hide'}`}>
          {toast.type === 'success' ? (
            <FaCheckCircle className="icon" />
          ) : (
            <FaExclamationCircle className="icon" />
          )}
          <span className="message">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default CreateAircraftPage; 