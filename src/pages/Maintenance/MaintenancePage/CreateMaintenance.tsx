import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaintenanceLog, CreateMaintenanceLogPayload } from '../../../types/maintenance';
import { createMaintenanceLog } from '../../../services/maintenance/maintenanceService';
import { FaArrowLeft, FaCheckCircle, FaExclamationCircle, FaCloudUploadAlt, FaTimes } from 'react-icons/fa';
import uploadPlaceholder from '../../../assets/images/upload.png';
import './CreateMaintenance.css';

const CreateMaintenancePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateMaintenanceLogPayload>({
    aircraft_id: 0,
    date_of_maintenance: new Date().toISOString(),
    details: '',
    maintenance_location: '',
    status: 'Pending',
    assigned_to: 0,
  });

  const [loading] = useState(false);
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.aircraft_id) newErrors.aircraft_id = 'Please select an aircraft';
    if (!formData.date_of_maintenance) newErrors.date_of_maintenance = 'Please select a date';
    if (!formData.maintenance_location) newErrors.maintenance_location = 'Please enter maintenance location';
    if (!formData.details) newErrors.details = 'Please enter maintenance details';
    if (!formData.assigned_to) newErrors.assigned_to = 'Please enter user ID';

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
      await createMaintenanceLog(formData);
      
      showToast('Maintenance log created successfully! Redirecting...', 'success');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/maintenance/maintenance', { 
        state: { 
          notification: {
            type: 'success',
            message: 'New maintenance log has been created successfully.'
          }
        }
      });

    } catch (error) {
      console.error('Error creating maintenance log:', error);
      
      let errorMessage = 'Unable to create maintenance log. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = `Failed to create maintenance log: ${error.message}`;
      }
      
      showToast(errorMessage, 'error');
      
      setTimeout(() => {
        setShowConfirmModal(true);
      }, 100);
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadgeClass = (status: string | undefined) => {
    const validStatus = status || 'Pending';
    switch (validStatus) {
      case 'Pending':
        return 'status-badge pending';
      case 'In Progress':
        return 'status-badge in-progress';
      case 'Completed':
        return 'status-badge completed';
      case 'Cancelled':
        return 'status-badge cancelled';
      default:
        return 'status-badge pending';
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
            <span>Maintenance</span>
            <span className="breadcrumb-separator">›</span>
            <span>Create New</span>
          </div>
          <h1 className="page-title">Create New Maintenance Log</h1>
        </div>
        <button className="back-button" onClick={() => navigate('/maintenance/maintenance')}>
          <FaArrowLeft /> Back to List
        </button>
      </div>

      <h2 className="section-title">Maintenance Details</h2>

      <div className="profile-form">
        <div className="form-layout">
          {/* Maintenance Image Upload */}
          <div 
            className={`maintenance-image ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedImage ? (
              <>
                <img src={selectedImage} alt="Selected maintenance" />
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
                    maintenance documentation here
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Form Fields */}
          <div className="form-fields">
            <div className="form-row">
              <div className="form-group">
                <label>Aircraft ID</label>
                <input
                  type="number"
                  value={formData.aircraft_id}
                  onChange={(e) => setFormData({ ...formData, aircraft_id: Number(e.target.value) })}
                  className={errors.aircraft_id ? 'error' : ''}
                  placeholder="Enter aircraft ID"
                />
                {errors.aircraft_id && (
                  <span className="error-message">
                    <FaExclamationCircle />
                    {errors.aircraft_id}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Date of Maintenance</label>
                <input
                  type="datetime-local"
                  value={formData.date_of_maintenance.slice(0, 16)}
                  onChange={(e) => setFormData({ ...formData, date_of_maintenance: new Date(e.target.value).toISOString() })}
                  className={errors.date_of_maintenance ? 'error' : ''}
                />
                {errors.date_of_maintenance && (
                  <span className="error-message">
                    <FaExclamationCircle />
                    {errors.date_of_maintenance}
                  </span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Maintenance Location</label>
                <input
                  type="text"
                  value={formData.maintenance_location}
                  onChange={(e) => setFormData({ ...formData, maintenance_location: e.target.value })}
                  className={errors.maintenance_location ? 'error' : ''}
                  placeholder="Enter maintenance location"
                />
                {errors.maintenance_location && (
                  <span className="error-message">
                    <FaExclamationCircle />
                    {errors.maintenance_location}
                  </span>
                )}
              </div>
              <div className="form-group">
                <label>User ID</label>
                <input
                  type="number"
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: Number(e.target.value) })}
                  className={errors.assigned_to ? 'error' : ''}
                  placeholder="Enter User ID"
                />
                {errors.assigned_to && (
                  <span className="error-message">
                    <FaExclamationCircle />
                    {errors.assigned_to}
                  </span>
                )}
              </div>
              
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as MaintenanceLog['status'] })}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group full-width">
                <label>Maintenance Details</label>
                <textarea
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  rows={6}
                  placeholder="Enter maintenance details and notes..."
                  className={errors.details ? 'error' : ''}
                />
                {errors.details && (
                  <span className="error-message">
                    <FaExclamationCircle />
                    {errors.details}
                  </span>
                )}
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
            <>Create Maintenance Log</>
          )}
        </button>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>Confirm Create Maintenance Log</h2>
            <p>Are you sure you want to create this maintenance log with the following details?</p>
            
            <div className="modal-details">
              <div className="detail-row">
                <strong>Aircraft ID:</strong> {formData.aircraft_id}
              </div>
              <div className="detail-row">
                <strong>Date:</strong> {new Date(formData.date_of_maintenance).toLocaleString()}
              </div>
              <div className="detail-row">
                <strong>Location:</strong> {formData.maintenance_location}
              </div>
              <div className="detail-row status">
                <strong>Status:</strong> 
                <span className={getStatusBadgeClass(formData.status)}>
                  {formData.status}
                </span>
              </div>
              <div className="detail-row">
                <strong>Details:</strong> 
                <span className="details-text">
                  {formData.details || '-'}
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

export default CreateMaintenancePage; 