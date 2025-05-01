import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Aircraft, AircraftModel, AirlineModel } from '../../../types/aircraft';
import { createAircraft, getAircraftModels, getAirlineModels } from '../../../services/aircraft/aircraftService';
import { FaArrowLeft, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import './CreateAircraftPage.css';

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
          <FaArrowLeft /> Back
        </button>
      </div>

      <h2 className="section-title">Aircraft Profile</h2>

      <div className="profile-form">
        <div className="form-layout">
          {/* Left side - Aircraft Image */}
          <div className="aircraft-image">
            <img src="/aircraft-placeholder.png" alt="Aircraft" />
          </div>

          {/* Right side - Form Fields */}
          <div className="form-fields">
            <div className="form-row">
              <div className="form-group">
                <label>Model Name</label>
                <select
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className={errors.model ? 'error' : ''}
                >
                  <option value="">Select Model</option>
                  {modelOptions.map((model) => (
                    <option key={model.model_id} value={model.model_name}>
                      {model.model_name}
                    </option>
                  ))}
                </select>
                {errors.model && <span className="error-message">{errors.model}</span>}
              </div>

              <div className="form-group">
                <label>Airline Owner</label>
                <select
                  value={formData.airline_owner}
                  onChange={(e) => setFormData({ ...formData, airline_owner: e.target.value })}
                  className={errors.airline_owner ? 'error' : ''}
                >
                  <option value="">Select Airline</option>
                  {airlineOptions.map((airline) => (
                    <option key={airline.id} value={airline.name}>
                      {airline.name}
                    </option>
                  ))}
                </select>
                {errors.airline_owner && <span className="error-message">{errors.airline_owner}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Maintenance Status</label>
                <select
                  value={formData.maintenance_status}
                  onChange={(e) => setFormData({ ...formData, maintenance_status: e.target.value as Aircraft['maintenance_status'] })}
                  className={errors.maintenance_status ? 'error' : ''}
                >
                  <option value="Operational">Operational</option>
                  <option value="In Maintenance">In Maintenance</option>
                  <option value="Retired">Retired</option>
                </select>
                {errors.maintenance_status && <span className="error-message">{errors.maintenance_status}</span>}
              </div>

              <div className="form-group">
                <label>Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  className={errors.capacity ? 'error' : ''}
                />
                {errors.capacity && <span className="error-message">{errors.capacity}</span>}
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
                />
                {errors.manufacture_year && <span className="error-message">{errors.manufacture_year}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Aircraft History</label>
                <textarea
                  value={formData.aircraft_history}
                  onChange={(e) => setFormData({ ...formData, aircraft_history: e.target.value })}
                  rows={6}
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                className="create-button" 
                onClick={handleSubmit} 
                disabled={saving}
              >
                {saving ? 'Creating...' : 'Create Aircraft'}
              </button>
              <button 
                className="cancel-button" 
                onClick={() => navigate('/admin/aircrafts')} 
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
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