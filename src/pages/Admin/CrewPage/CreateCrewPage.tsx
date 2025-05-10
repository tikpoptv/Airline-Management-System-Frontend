import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaPassport, FaEnvelope, FaArrowLeft, FaSave, FaCheckCircle, FaExclamationCircle, FaSpinner } from 'react-icons/fa';
import { createCrew } from '../../../services/crew/crewService';
import { createUser } from '../../../services/user/userService';
import './CreateCrewPage.css';

type CrewRole = 'Pilot' | 'Co-Pilot' | 'Attendant' | 'Technician';
type CrewStatus = 'active' | 'inactive' | 'on_leave' | 'training';

interface FormData {
  name: string;
  passport_number: string;
  role: CrewRole;
  license_expiry_date: string;
  passport_expiry_date: string;
  flight_hours: number;
  user_id?: number;
  status: CrewStatus;
  username: string;
  email: string;
  password: string;
  user_role: 'admin' | 'crew' | 'maintenance';
}

interface ValidationErrors {
  name?: string;
  passport_number?: string;
  role?: string;
  license_expiry_date?: string;
  passport_expiry_date?: string;
  flight_hours?: string;
  user_id?: string;
  username?: string;
  email?: string;
  password?: string;
  user_role?: string;
}

const CreateCrewPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    passport_number: '',
    role: 'Pilot',
    license_expiry_date: '',
    passport_expiry_date: '',
    flight_hours: 0,
    status: 'active',
    username: '',
    email: '',
    password: '',
    user_role: 'crew'
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState<'idle' | 'creating_user' | 'verifying_user' | 'creating_crew'>('idle');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [notificationMessage, setNotificationMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'flight_hours' ? parseFloat(value) : 
              name === 'user_id' ? (value ? parseInt(value) : undefined) : 
              value
    }));
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Required fields
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.passport_number) {
      newErrors.passport_number = 'Passport number is required';
    }
    
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }
    
    if (!formData.license_expiry_date) {
      newErrors.license_expiry_date = 'License expiry date is required';
    } else if (new Date(formData.license_expiry_date) < new Date()) {
      newErrors.license_expiry_date = 'License expiry date must be in the future';
    }
    
    if (!formData.passport_expiry_date) {
      newErrors.passport_expiry_date = 'Passport expiry date is required';
    } else if (new Date(formData.passport_expiry_date) < new Date()) {
      newErrors.passport_expiry_date = 'Passport expiry date must be in the future';
    }
    
    if (formData.flight_hours < 0) {
      newErrors.flight_hours = 'Flight hours cannot be negative';
    }

    // Validate user account fields
    if (!formData.username) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.user_role) {
      newErrors.user_role = 'User role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  };

  const handleConfirmedSave = async () => {
    try {
      setIsCreating(true);
      
      // Step 1: Create User
      setCreationStep('creating_user');
      const userResponse = await createUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.user_role
      });

      console.log('[DEBUG] User creation successful:', userResponse);
      
      if (!userResponse || !userResponse.user_id) {
        throw new Error('Invalid user response: Missing user_id');
      }

      // Step 2: Create Crew
      setCreationStep('creating_crew');
      console.log('[DEBUG] Creating crew member for user:', userResponse.user_id);
      
      const crewData = {
        name: formData.name,
        passport_number: formData.passport_number,
        role: formData.role,
        license_expiry_date: formData.license_expiry_date,
        passport_expiry_date: formData.passport_expiry_date,
        flight_hours: formData.flight_hours,
        status: formData.status,
        user_id: userResponse.user_id
      };

      console.log('[DEBUG] Sending crew data:', crewData);
      
      const crewResponse = await createCrew(crewData);
      console.log('[DEBUG] Crew creation response:', crewResponse);

      if (!crewResponse || !crewResponse.ID) {
        throw new Error('Invalid crew response: Missing ID');
      }

      // Step 3: Success
      setShowConfirmModal(false);
      showToast(`Crew member created successfully!
Name: ${crewResponse.name}
Role: ${crewResponse.role}
Status: ${crewResponse.status.toUpperCase()}
ID: ${crewResponse.ID}`, 'success');

      // รอ 3 วินาทีก่อน navigate
      setTimeout(() => {
        navigate(`/admin/crew/${crewResponse.ID}`);
      }, 3000);

    } catch (error) {
      setShowConfirmModal(false);
      let errorMsg = 'Failed to create crew member';
      
      if (error instanceof Error) {
        errorMsg = error.message;
        console.error('[DEBUG] Error in crew creation:', {
          message: error.message,
          step: creationStep,
          stack: error.stack
        });
      } else {
        console.error('[DEBUG] Unknown error:', error);
      }
      
      showToast(errorMsg, 'error');
    } finally {
      setIsCreating(false);
      setCreationStep('idle');
    }
  };

  return (
    <div className="create-crew-page">
      <div className="create-header">
        <div className="breadcrumb">
          <span>Crew</span>
          <span className="separator">/</span>
          <span>Create New</span>
        </div>
        <h1>Create New Crew Member</h1>
        <div className="header-actions">
          <button 
            className={`save-button ${isCreating ? 'loading' : ''}`}
            onClick={handleSave}
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <FaSpinner className="loading-spinner" />
                Creating...
              </>
            ) : (
              <>
                <FaSave /> Create
              </>
            )}
          </button>
          <button 
            className="back-button" 
            onClick={() => navigate('/admin/crew')}
            disabled={isCreating}
          >
            <FaArrowLeft /> Cancel
          </button>
        </div>
      </div>

      <div className="crew-form-grid">
        <div className="profile-image-section">
          <img 
            src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
            alt="Default profile"
            className="crew-image" 
          />
          <div className="crew-basic-info">
            <div className="info-row">
              <span className="label">NAME</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`create-input ${errors.name ? 'error' : ''}`}
                placeholder="Enter crew member name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
            <div className="info-row">
              <span className="label">STATUS</span>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="create-select"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
                <option value="training">Training</option>
              </select>
            </div>
          </div>
        </div>

        <div className="crew-details-sections">
          <div className="info-section">
            <div className="section-header">
              <FaUser className="section-icon" />
              <h2>Personal Information</h2>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <label>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={`create-select ${errors.role ? 'error' : ''}`}
                >
                  <option value="Pilot">Pilot</option>
                  <option value="Co-Pilot">Co-Pilot</option>
                  <option value="Attendant">Attendant</option>
                  <option value="Technician">Technician</option>
                </select>
                {errors.role && <span className="error-message">{errors.role}</span>}
              </div>
              <div className="info-item">
                <label>Flight Hours</label>
                <input
                  type="number"
                  name="flight_hours"
                  value={formData.flight_hours}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  className={`create-input ${errors.flight_hours ? 'error' : ''}`}
                />
                {errors.flight_hours && <span className="error-message">{errors.flight_hours}</span>}
              </div>
            </div>
          </div>

          <div className="info-section">
            <div className="section-header">
              <FaPassport className="section-icon" />
              <h2>Document Information</h2>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <label>Passport Number</label>
                <input
                  type="text"
                  name="passport_number"
                  value={formData.passport_number}
                  onChange={handleInputChange}
                  className={`create-input ${errors.passport_number ? 'error' : ''}`}
                  placeholder="Enter passport number"
                />
                {errors.passport_number && <span className="error-message">{errors.passport_number}</span>}
              </div>
              <div className="info-item">
                <label>Passport Expiry Date</label>
                <input
                  type="date"
                  name="passport_expiry_date"
                  value={formData.passport_expiry_date}
                  onChange={handleInputChange}
                  className={`create-input ${errors.passport_expiry_date ? 'error' : ''}`}
                />
                {errors.passport_expiry_date && <span className="error-message">{errors.passport_expiry_date}</span>}
              </div>
              <div className="info-item">
                <label>License Expiry Date</label>
                <input
                  type="date"
                  name="license_expiry_date"
                  value={formData.license_expiry_date}
                  onChange={handleInputChange}
                  className={`create-input ${errors.license_expiry_date ? 'error' : ''}`}
                />
                {errors.license_expiry_date && <span className="error-message">{errors.license_expiry_date}</span>}
              </div>
            </div>
          </div>

          <div className="info-section">
            <div className="section-header">
              <FaEnvelope className="section-icon" />
              <h2>User Account Information</h2>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`create-input ${errors.username ? 'error' : ''}`}
                  placeholder="Enter username"
                />
                {errors.username && <span className="error-message">{errors.username}</span>}
              </div>
              <div className="info-item">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`create-input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter email"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>
              <div className="info-item">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`create-input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter password"
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>
              <div className="info-item">
                <label>User Role</label>
                <select
                  name="user_role"
                  value={formData.user_role}
                  onChange={handleInputChange}
                  className={`create-select ${errors.user_role ? 'error' : ''}`}
                >
                  <option value="admin">Admin</option>
                  <option value="crew">Crew</option>
                  <option value="maintenance">Maintenance</option>
                </select>
                {errors.user_role && <span className="error-message">{errors.user_role}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            {isCreating && (
              <div className="modal-loading-overlay">
                <div className="modal-loading-spinner" />
                <div className="modal-loading-text">
                  {creationStep === 'creating_user' && 'Creating user account...'}
                  {creationStep === 'verifying_user' && 'Verifying user account...'}
                  {creationStep === 'creating_crew' && 'Creating crew member...'}
                </div>
              </div>
            )}
            <h3>Confirm New Crew Member</h3>
            <p>Please review the crew member details before creating:</p>
            
            <div className="modal-details">
              <div className="detail-row">
                <strong>Name:</strong>
                <span>{formData.name}</span>
              </div>
              <div className="detail-row">
                <strong>Role:</strong>
                <span>{formData.role}</span>
              </div>
              <div className="detail-row">
                <strong>Status:</strong>
                <span className={`status-badge ${formData.status}`}>
                  {formData.status.toUpperCase()}
                </span>
              </div>
              <div className="detail-row">
                <strong>Passport Number:</strong>
                <span>{formData.passport_number}</span>
              </div>
              <div className="detail-row">
                <strong>Flight Hours:</strong>
                <span>{formData.flight_hours}</span>
              </div>
              <div className="detail-row">
                <strong>License Expires:</strong>
                <span>{formData.license_expiry_date}</span>
              </div>
              <div className="detail-row">
                <strong>Passport Expires:</strong>
                <span>{formData.passport_expiry_date}</span>
              </div>
              <div className="detail-row">
                <strong>Username:</strong>
                <span>{formData.username}</span>
              </div>
              <div className="detail-row">
                <strong>Email:</strong>
                <span>{formData.email}</span>
              </div>
              <div className="detail-row">
                <strong>User Role:</strong>
                <span className="role-badge">
                  {formData.user_role.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className={`confirm-button ${isCreating ? 'loading' : ''}`}
                onClick={handleConfirmedSave}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <FaSpinner className="loading-spinner" />
                    {creationStep === 'creating_user' && 'Creating User...'}
                    {creationStep === 'verifying_user' && 'Verifying User...'}
                    {creationStep === 'creating_crew' && 'Creating Crew...'}
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
              <button
                className="cancel-button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isCreating}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Popup */}
      {showNotification && (
        <div className={`notification-popup ${notificationType} ${showNotification ? 'show' : ''}`}>
          {notificationType === 'success' ? (
            <FaCheckCircle className="icon" />
          ) : (
            <FaExclamationCircle className="icon" />
          )}
          <span className="message">{notificationMessage}</span>
        </div>
      )}
    </div>
  );
};

export default CreateCrewPage; 