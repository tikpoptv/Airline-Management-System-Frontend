import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Crew } from '../../../types/crew';
import { getCrewById, updateCrew } from '../../../services/crew/crewService';
import { FaUser, FaPassport, FaEnvelope, FaArrowLeft, FaSave } from 'react-icons/fa';
import Loading from '../../../components/Loading';
import './EditCrewPage.css';

type CrewRole = 'Pilot' | 'Co-Pilot' | 'Attendant' | 'Technician';
type CrewStatus = 'active' | 'inactive' | 'on_leave' | 'training';

interface FormData {
  name: string;
  role: CrewRole;
  flight_hours: number;
  status: CrewStatus;
}

const EditCrewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [crew, setCrew] = useState<Crew | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    role: 'Pilot',
    flight_hours: 0,
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
        const crewData = await getCrewById(Number(id));
        setCrew(crewData);
        setFormData({
          name: crewData.name,
          role: crewData.role,
          flight_hours: crewData.flight_hours,
          status: crewData.status
        });
      } catch (err) {
        setError('Unable to load crew member data');
        console.error('Error fetching crew:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCrew();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'flight_hours' ? parseFloat(value) : value
    }));
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
      await updateCrew(crew.crew_id, formData);
      setShowConfirmModal(false);
      showToast('Crew member updated successfully!', 'success');
      setTimeout(() => {
        navigate(`/admin/crew/${crew.crew_id}`);
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

  if (loading) return <Loading message="Loading crew member data..." />;
  if (error) return <div className="error-message">{error}</div>;
  if (!crew) return <div className="error-message">Crew member not found</div>;

  const getChangedFields = () => {
    const changes = [];
    if (formData.name !== crew.name) {
      changes.push({ field: 'Name', from: crew.name, to: formData.name });
    }
    if (formData.role !== crew.role) {
      changes.push({ field: 'Role', from: crew.role, to: formData.role });
    }
    if (formData.flight_hours !== crew.flight_hours) {
      changes.push({ 
        field: 'Flight Hours', 
        from: crew.flight_hours.toFixed(1), 
        to: formData.flight_hours.toFixed(1) 
      });
    }
    if (formData.status !== crew.status) {
      changes.push({ field: 'Status', from: crew.status, to: formData.status });
    }
    return changes;
  };

  return (
    <div className="edit-crew-page">
      <div className="edit-header">
        <div className="breadcrumb">
          <span>Crew</span>
          <span className="separator">/</span>
          <span>Edit</span>
        </div>
        <h1>Edit Crew Member</h1>
        <div className="header-actions">
          <button 
            className="save-button" 
            onClick={handleSave}
            disabled={saving}
          >
            <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button 
            className="back-button" 
            onClick={() => navigate(`/admin/crew/${crew.crew_id}`)}
            disabled={saving}
          >
            <FaArrowLeft /> Cancel
          </button>
        </div>
      </div>

      <div className="crew-profile-grid">
        <div className="profile-image-section">
          <img 
            src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
            alt={`${crew.name}'s profile`}
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
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="edit-select"
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
                <input
                  type="number"
                  name="flight_hours"
                  value={formData.flight_hours}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  className="edit-input"
                />
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
                <span className="readonly-value">{crew.passport_number}</span>
              </div>
              <div className="info-item">
                <label>Passport Expiry</label>
                <span className="readonly-value">
                  {new Date(crew.passport_expiry_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="info-item">
                <label>License Expiry</label>
                <span className="readonly-value">
                  {new Date(crew.license_expiry_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {crew.user && (
            <div className="info-section">
              <div className="section-header">
                <FaEnvelope className="section-icon" />
                <h2>Contact Information</h2>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <label>User ID</label>
                  <span className="readonly-value">{crew.user.user_id}</span>
                </div>
                <div className="info-item">
                  <label>Username</label>
                  <span className="readonly-value">{crew.user.username}</span>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <span className="readonly-value">{crew.user.email}</span>
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
            <div className="modal-diff">
              {getChangedFields().map((change, index) => (
                <div key={index} className="change-item">
                  <span className="change-field">{change.field}:</span>
                  <div className="change-values">
                    <span className="old-value">{change.from}</span>
                    <span className="arrow">→</span>
                    <span className="new-value">{change.to}</span>
                  </div>
                </div>
              ))}
              {getChangedFields().length === 0 && (
                <p>No changes detected</p>
              )}
            </div>
            <div className="modal-actions">
              <button 
                className="confirm-button" 
                onClick={handleConfirmedSave}
                disabled={saving || getChangedFields().length === 0}
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

export default EditCrewPage; 