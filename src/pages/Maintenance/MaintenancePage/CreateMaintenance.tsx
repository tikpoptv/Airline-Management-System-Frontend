import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaintenanceLog, CreateMaintenanceLogPayload } from '../../../types/maintenance';
import { createMaintenanceLog } from '../../../services/maintenance/maintenanceService';
import { FaArrowLeft, FaCheckCircle, FaExclamationCircle, FaCloudUploadAlt, FaTimes } from 'react-icons/fa';
import uploadPlaceholder from '../../../assets/images/upload.png';
import styles from './CreateMaintenance.module.css';

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
    // Get user ID from localStorage and set in form
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const userData = JSON.parse(userJson);
        if (userData && userData.user_id) {
          setFormData(prev => ({
            ...prev,
            assigned_to: userData.user_id
          }));
        }
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }

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
    
    // Only validate assigned_to if it's not available from localStorage
    if (!formData.assigned_to && !localStorage.getItem('userId')) {
      newErrors.assigned_to = 'User ID not available';
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
      await createMaintenanceLog(formData);
      
      showToast('Maintenance log created successfully! Redirecting...', 'success');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/maintenance/log', { 
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
        return styles['status-badge'] + ' ' + styles['pending'];
      case 'In Progress':
        return styles['status-badge'] + ' ' + styles['in-progress'];
      case 'Completed':
        return styles['status-badge'] + ' ' + styles['completed'];
      case 'Cancelled':
        return styles['status-badge'] + ' ' + styles['cancelled'];
      default:
        return styles['status-badge'] + ' ' + styles['pending'];
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
    <div className={styles['content-container']}>
      <div className={styles['page-header']}>
        <div>
          <div className={styles['breadcrumb']}>
            <span>Maintenance</span>
            <span className={styles['breadcrumb-separator']}>›</span>
            <span>Create New</span>
          </div>
          <h1 className={styles['page-title']}>Create New Maintenance Log</h1>
        </div>
        <button className={styles['back-button']} onClick={() => navigate('/maintenance/log')}>
          <FaArrowLeft /> Back to List
        </button>
      </div>

      <h2 className={styles['section-title']}>Maintenance Details</h2>

      <div className={styles['profile-form']}>
        <div className={styles['form-layout']}>
          {/* Maintenance Image Upload */}
          <div 
            className={`${styles['maintenance-image']} ${isDragging ? styles['dragging'] : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {selectedImage ? (
              <>
                <img src={selectedImage} alt="Selected maintenance" />
                <button className={styles['remove-image']} onClick={removeImage}>
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
                <img src={uploadPlaceholder} alt="Upload placeholder" className={styles['placeholder-image']} />
                <div className={styles['upload-overlay']}>
                  <FaCloudUploadAlt className={styles['upload-icon']} />
                  <span className={styles['upload-text']}>
                    Click to upload or drag and drop
                    <br />
                    maintenance documentation here
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Form Fields */}
          <div className={styles['form-fields']}>
            <div className={styles['form-row']}>
              <div className={styles['form-group']}>
                <label>Aircraft ID</label>
                <input
                  type="number"
                  value={formData.aircraft_id}
                  onChange={(e) => setFormData({ ...formData, aircraft_id: Number(e.target.value) })}
                  className={errors.aircraft_id ? styles['error'] : ''}
                  placeholder="Enter aircraft ID"
                />
                {errors.aircraft_id && (
                  <span className={styles['error-message']}>
                    <FaExclamationCircle />
                    {errors.aircraft_id}
                  </span>
                )}
              </div>

              <div className={styles['form-group']}>
                <label>Date of Maintenance</label>
                <input
                  type="datetime-local"
                  value={formData.date_of_maintenance.slice(0, 16)}
                  onChange={(e) => setFormData({ ...formData, date_of_maintenance: new Date(e.target.value).toISOString() })}
                  className={errors.date_of_maintenance ? styles['error'] : ''}
                />
                {errors.date_of_maintenance && (
                  <span className={styles['error-message']}>
                    <FaExclamationCircle />
                    {errors.date_of_maintenance}
                  </span>
                )}
              </div>
            </div>

            <div className={styles['form-row']}>
              <div className={styles['form-group']}>
                <label>Maintenance Location</label>
                <input
                  type="text"
                  value={formData.maintenance_location}
                  onChange={(e) => setFormData({ ...formData, maintenance_location: e.target.value })}
                  className={errors.maintenance_location ? styles['error'] : ''}
                  placeholder="Enter maintenance location"
                />
                {errors.maintenance_location && (
                  <span className={styles['error-message']}>
                    <FaExclamationCircle />
                    {errors.maintenance_location}
                  </span>
                )}
              </div>
              <div className={styles['form-group']}>
                <label>User ID</label>
                <input
                  type="number"
                  value={formData.assigned_to}
                  className={`${errors.assigned_to ? styles['error'] : ''} ${styles['readonly-field']}`}
                  placeholder="Auto-filled from login"
                  readOnly
                />
                {errors.assigned_to && (
                  <span className={styles['error-message']}>
                    <FaExclamationCircle />
                    {errors.assigned_to}
                  </span>
                )}
              </div>
              
            </div>

            <div className={styles['form-row']}>
              <div className={`${styles['form-group']} ${styles['full-width']}`}>
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as MaintenanceLog['status'] })}
                  style={{ position: 'relative', zIndex: 1000 }}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className={styles['form-row']}>
              <div className={`${styles['form-group']} ${styles['full-width']}`}>
                <label>Maintenance Details</label>
                <textarea
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  rows={6}
                  placeholder="Enter maintenance details and notes..."
                  className={errors.details ? styles['error'] : ''}
                />
                {errors.details && (
                  <span className={styles['error-message']}>
                    <FaExclamationCircle />
                    {errors.details}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles['form-actions']}>
        <button
          className={styles['create-button']}
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
        <div className={styles['modal-backdrop']}>
          <div className={styles['modal-content']}>
            <h2>Confirm Create Maintenance Log</h2>
            <p>Are you sure you want to create this maintenance log with the following details?</p>
            
            <div className={styles['modal-details']}>
              <div className={styles['detail-row']}>
                <strong>Aircraft ID:</strong> {formData.aircraft_id}
              </div>
              <div className={styles['detail-row']}>
                <strong>Date:</strong> {new Date(formData.date_of_maintenance).toLocaleString()}
              </div>
              <div className={styles['detail-row']}>
                <strong>Location:</strong> {formData.maintenance_location}
              </div>
              <div className={styles['detail-row']}>
                <strong>Assigned To:</strong> Current User (ID: {formData.assigned_to})
              </div>
              <div className={styles['detail-row']}>
                <strong>Status:</strong> 
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'flex-start'
                }}>
                  <div 
                    className={getStatusBadgeClass(formData.status)}
                    style={{ 
                      marginLeft: 0, 
                      display: 'inline-flex', 
                      justifyContent: 'center',
                      width: 'auto',
                      minWidth: '100px'
                    }}
                  >
                    {formData.status}
                  </div>
                </div>
              </div>
              <div className={styles['detail-row']}>
                <strong>Details:</strong> 
                <span className={styles['details-text']}>
                  {formData.details || '-'}
                </span>
              </div>
            </div>

            <div className={styles['modal-actions']}>
              <button 
                className={styles['confirm-button']} 
                onClick={handleConfirmCreate}
                disabled={saving}
              >
                {saving ? 'Creating...' : 'Confirm'}
              </button>
              <button 
                className={styles['cancel-button']}
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
        <div className={`${styles['notification-popup']} ${styles[toast.type]} ${toast.show ? styles['show'] : styles['hide']}`}>
          {toast.type === 'success' ? (
            <FaCheckCircle className={styles['icon']} />
          ) : (
            <FaExclamationCircle className={styles['icon']} />
          )}
          <span className={styles['message']}>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default CreateMaintenancePage; 