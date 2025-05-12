import { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import { CrewProfile, UpdateCrewProfilePayload } from '../../../types/crewuser';
import { getCrewProfile, updateCrewProfile } from '../../../services/crewuser/crewuserService';
import { FaUser, FaPassport, FaEnvelope, FaArrowLeft, FaSave } from 'react-icons/fa';
import Loading from '../../../components/Loading';
import './EditCrewUserPage.css';
import 'react-datepicker/dist/react-datepicker.css';

type CrewStatus = 'active' | 'inactive' | 'on_leave' | 'training';

interface FormData extends UpdateCrewProfilePayload {
  status: CrewStatus;
}

const EditCrewUserPage = () => {
  const navigate = useNavigate();
  const [crew, setCrew] = useState<CrewProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    role: 'Pilot',
    passport_number: '',
    license_expiry_date: '',
    passport_expiry_date: '',
    status: 'active'
  });
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    const fetchCrew = async () => {
      try {
        setLoading(true);
        const crewData = await getCrewProfile();
        setCrew(crewData);
        setFormData({
          name: crewData.name,
          role: crewData.role,
          passport_number: crewData.passport_number,
          license_expiry_date: crewData.license_expiry_date,
          passport_expiry_date: crewData.passport_expiry_date,
          status: crewData.status
        });
      } catch (err) {
        setError('Unable to load crew member data');
        console.error('Error fetching crew:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCrew();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'passport_expiry_date' || name === 'license_expiry_date') {
      setFormData(prev => ({
        ...prev,
        [name]: value.slice(0, 10)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleSave = () => {
    if (!crew) return;
    setShowConfirmModal(true);
  };

  const handleConfirmedSave = async () => {
    if (!crew) return;

    try {
      setSaving(true);
      const { name, role, passport_number } = formData;
      const license_expiry_date = formData.license_expiry_date.slice(0, 10);
      const passport_expiry_date = formData.passport_expiry_date.slice(0, 10);
      await updateCrewProfile({ name, role, passport_number, license_expiry_date, passport_expiry_date });
      setShowConfirmModal(false);
      showToast('Crew member updated successfully!', 'success');
      setTimeout(() => {
        navigate(`/crew/crew/${crew.crew_id}`);
      }, 2000);
    } catch (err) {
      setShowConfirmModal(false);
      const errorMsg = err instanceof Error ? err.message : 'Failed to update crew member';
      showToast(errorMsg, 'error');
      console.error('Error updating crew:', err);
    } finally {
      setSaving(false);
    }
  };

  // Simple date format validation (yyyy-mm-dd)
  const isValidDate = (dateStr: string) => {
    const datePart = dateStr.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(datePart);
  };

  if (loading) return <Loading message="Loading crew member data..." />;
  if (error) return <div className="error-message">{error}</div>;
  if (!crew) return <div className="error-message">Crew member not found</div>;

  // Helper functions for status/role display
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'on_leave': return 'status-on-leave';
      case 'training': return 'status-training';
      default: return '';
    }
  };
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'on_leave': return 'On Leave';
      case 'training': return 'Training';
      default: return status;
    }
  };

  const getNameParts = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || ''
    };
  };
  const { firstName, lastName } = getNameParts(formData.name);

  return (
    <div className="crew-details-page">
      <div className="details-header">
        <div className="breadcrumb">
          <span>Crew</span>
          <span className="separator">/</span>
          <span>Edit</span>
        </div>
        <h1>Edit Crew Details</h1>
        <div className="header-actions">
          <button className="save-button" onClick={handleSave} disabled={saving}>
            <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button className="back-button" onClick={() => navigate('/crew/crew')} disabled={saving}>
            <FaArrowLeft /> Cancel
          </button>
        </div>
      </div>

      <div className="crew-profile-grid">
        <div className="profile-image-section">
          <img
            src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
            alt={`${formData.name}'s profile`}
            className="crew-image"
          />
          <div className="crew-basic-info">
            <div className="info-row">
              <span className="label">CREW ID</span>
              <span className="value">{crew.crew_id}</span>
            </div>
            <div className="info-row">
              <span className="label">NAME</span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="edit-input"
              />
            </div>
            <div className="info-row">
              <span className="label">STATUS</span>
              <span className={`status-badge ${getStatusColor(formData.status)}`}>{getStatusText(formData.status)}</span>
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
                <label>First Name</label>
                <span>{firstName}</span>
              </div>
              <div className="info-item">
                <label>Last Name</label>
                <span>{lastName}</span>
              </div>
              <div className="info-item">
                <label>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="edit-select"
                >
                  <option value="Pilot">Pilot</option>
                  <option value="Co-Pilot">Co-Pilot</option>
                  <option value="Attendant">Attendant</option>
                  <option value="Technician">Technician</option>
                </select>
              </div>
              <div className="info-item">
                <label>Flight Hours</label>
                <span>{crew.flight_hours.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} hours</span>
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
                  className="edit-input"
                />
              </div>
              <div className="info-item">
                <label>Passport Expiry</label>
                <input
                  type="text"
                  name="passport_expiry_date"
                  value={formData.passport_expiry_date.slice(0, 10)}
                  onChange={handleInputChange}
                  className={`edit-input${formData.passport_expiry_date && !isValidDate(formData.passport_expiry_date) ? ' invalid-date' : ''}`}
                  placeholder="yyyy-mm-dd"
                />
              </div>
              <div className="info-item">
                <label>License Expiry</label>
                <input
                  type="text"
                  name="license_expiry_date"
                  value={formData.license_expiry_date.slice(0, 10)}
                  onChange={handleInputChange}
                  className={`edit-input${formData.license_expiry_date && !isValidDate(formData.license_expiry_date) ? ' invalid-date' : ''}`}
                  placeholder="yyyy-mm-dd"
                />
              </div>
            </div>
          </div>

          {crew.user && (
            <div className="info-section contact-section">
              <div className="section-header">
                <FaEnvelope className="section-icon" />
                <h2>Contact Information</h2>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <label>User ID</label>
                  <span>{crew.user.user_id}</span>
                </div>
                <div className="info-item">
                  <label>Username</label>
                  <span>{crew.user.username}</span>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <span>{crew.user.email}</span>
                </div>
              </div>
            </div>
          )}

          <div className="schedule-section disabled">
            <div className="disabled-message">
              Flight Schedule cannot be displayed in edit mode
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Confirm Changes</h3>
            {/* You can add a diff view here if you want */}
            <div className="modal-actions">
              <button
                className="confirm-button"
                onClick={handleConfirmedSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Confirm'}
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

      {/* Notification Toast */}
      {showNotification && (
        <div className={`notification-toast ${notificationType}`}>
          {notificationMessage}
        </div>
      )}
    </div>
  );
};

export default EditCrewUserPage; 