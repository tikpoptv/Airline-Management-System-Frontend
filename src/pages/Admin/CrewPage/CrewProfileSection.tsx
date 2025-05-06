import { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { Crew } from '../../../types/crew';
import avatarImg from '../../../assets/images/profile_web.webp';
import { updateCrewById, deleteCrewById } from '../../../services/crew/crewService';
import { useNavigate } from 'react-router-dom';

interface Props {
  editData: Crew;
  originalData: Crew;
  isEditMode: boolean;
  handleChange: <K extends keyof Crew>(field: K, value: Crew[K]) => void;
}

const CrewProfileSection = ({
  editData,
  originalData,
  isEditMode,
  handleChange,
}: Props) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const [firstName, setFirstName] = useState(() => editData.name.split(' ')[0] || '');
  const [lastName, setLastName] = useState(() => editData.name.split(' ').slice(1).join(' ') || '');

  useEffect(() => {
    const fullName = `${firstName} ${lastName}`.trim();
    handleChange('name', fullName);
  }, [firstName, handleChange, lastName]);

  const navigate = useNavigate();

  const triggerToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const confirmSave = async () => {
    setSaving(true);
    try {
      await updateCrewById(editData.crew_id, {
        name: editData.name,
        role: editData.role,
        flight_hours: editData.flight_hours,
        passport_number: editData.passport_number,
        license_expiry_date: editData.license_expiry_date,
        passport_expiry_date: editData.passport_expiry_date,
        crew_id: editData.user?.user_id,
      });

      triggerToast("✅ Crew updated successfully!", 'success');
      setShowConfirmModal(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      triggerToast("❌ Update failed: " + message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCrewById(editData.crew_id);
      triggerToast("✅ Crew deleted successfully!", 'success');
      navigate('/admin/crew');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      triggerToast("❌ Delete failed: " + message, 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    // Keep the format as is, just ensuring it's handled properly
    return dateString;
  };

  return (
    <div className="profile-wrapper">
      <div className="form-container">
        {/* Left Column - Avatar and Work Section */}
        <div className="left-column">
          <div className="avatar-section">
            <div className="profile-avatar">
              <img src={avatarImg} alt="avatar" />
            </div>
          </div>

          <div className="section work-section">
            <h2>Work</h2>
            <div className="field-group">
              <label>Role</label>
              {isEditMode ? (
                <select
                  value={editData.role}
                  onChange={(e) => handleChange('role', e.target.value as Crew['role'])}
                >
                  <option value="Pilot">Pilot</option>
                  <option value="Co-Pilot">Co-Pilot</option>
                  <option value="Attendant">Attendant</option>
                  <option value="Technician">Technician</option>
                </select>
              ) : (
                <div className="read-only-field">{editData.role}</div>
              )}
            </div>

            <div className="field-group">
              <label>Crew ID</label>
              <div className="input-with-icon">
                <div className="read-only-field">{editData.crew_id}</div>
                {isEditMode && (
                  <button className="delete-button" onClick={() => setShowDeleteConfirm(true)}>
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>

            <div className="field-group">
              <label>Flight hours</label>
              {isEditMode ? (
                <input
                  type="number"
                  value={editData.flight_hours}
                  onChange={(e) => handleChange('flight_hours', Number(e.target.value))}
                />
              ) : (
                <div className="read-only-field">{editData.flight_hours}</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Information and Contact Sections */}
        <div className="right-column">
          {/* Information Section */}
          <div className="section information-section">
            <h2>Information</h2>
            <div className="field-row">
              <div className="field-group">
                <label>First name</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                ) : (
                  <div className="read-only-field">{firstName}</div>
                )}
              </div>
              
              <div className="field-group">
                <label>Last name</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                ) : (
                  <div className="read-only-field">{lastName}</div>
                )}
              </div>
            </div>

            <div className="field-row">
              <div className="field-group">
                <label>Role</label>
                {isEditMode ? (
                  <select
                    value={editData.role}
                    onChange={(e) => handleChange('role', e.target.value as Crew['role'])}
                  >
                    <option value="Pilot">Pilot</option>
                    <option value="Co-Pilot">Co-Pilot</option>
                    <option value="Attendant">Attendant</option>
                    <option value="Technician">Technician</option>
                  </select>
                ) : (
                  <div className="read-only-field">{editData.role}</div>
                )}
              </div>
              
              <div className="field-group">
                <label>License expire date</label>
                {isEditMode ? (
                  <input
                    type="date"
                    value={editData.license_expiry_date}
                    onChange={(e) => handleChange('license_expiry_date', e.target.value)}
                  />
                ) : (
                  <div className="read-only-field">{formatDate(editData.license_expiry_date)}</div>
                )}
              </div>
            </div>

            <div className="field-row">
              <div className="field-group">
                <label>Passport number</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editData.passport_number}
                    onChange={(e) => handleChange('passport_number', e.target.value)}
                  />
                ) : (
                  <div className="read-only-field">{editData.passport_number}</div>
                )}
              </div>
              
              <div className="field-group">
                <label>Passport expire date</label>
                {isEditMode ? (
                  <input
                    type="date"
                    value={editData.passport_expiry_date}
                    onChange={(e) => handleChange('passport_expiry_date', e.target.value)}
                  />
                ) : (
                  <div className="read-only-field">{formatDate(editData.passport_expiry_date)}</div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="section contact-section">
            <h2>Contact</h2>
            <div className="field-row">
              <div className="field-group">
                <label>User ID</label>
                <div className="read-only-field">{editData.user?.user_id || 'N/A'}</div>
              </div>
              
              <div className="field-group">
                <label>Username</label>
                <div className="read-only-field">{editData.user?.username || 'N/A'}</div>
              </div>
            </div>

            <div className="field-group full-width">
              <label>Email</label>
              <div className="read-only-field">{editData.user?.email || 'N/A'}</div>
            </div>
          </div>

          {/* Save Button (when in edit mode) */}
          {isEditMode && (
            <div className="save-button-container">
              <button className="save-button" onClick={() => setShowConfirmModal(true)}>
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Creation date (shown at bottom right in goal image) */}
      {!isEditMode && (
        <div className="created-date">
          Created at {new Date().toISOString().split('T')[0]}
        </div>
      )}

      {/* Modals */}
      {showConfirmModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Confirm Edit Crew</h3>
            <div className="modal-diff">
              {editData.name !== originalData.name && (
                <p><strong>Name:</strong> {originalData.name} → {editData.name}</p>
              )}
              {editData.role !== originalData.role && (
                <p><strong>Role:</strong> {originalData.role} → {editData.role}</p>
              )}
              {editData.flight_hours !== originalData.flight_hours && (
                <p><strong>Flight Hours:</strong> {originalData.flight_hours} → {editData.flight_hours}</p>
              )}
              {editData.passport_number !== originalData.passport_number && (
                <p><strong>Passport Number:</strong> {originalData.passport_number} → {editData.passport_number}</p>
              )}
              {editData.passport_expiry_date !== originalData.passport_expiry_date && (
                <p><strong>Passport Expiry:</strong> {originalData.passport_expiry_date} → {editData.passport_expiry_date}</p>
              )}
              {editData.license_expiry_date !== originalData.license_expiry_date && (
                <p><strong>License Expiry:</strong> {originalData.license_expiry_date} → {editData.license_expiry_date}</p>
              )}
            </div>
            <div className="modal-actions">
              <button className="confirm-button" onClick={confirmSave} disabled={saving}>
                {saving ? 'Saving...' : 'Confirm'}
              </button>
              <button className="cancel-button" onClick={() => setShowConfirmModal(false)} disabled={saving}>
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Confirm Delete Crew</h3>
            <p>Are you sure you want to delete Crew ID: {editData.crew_id}?</p>
            <div className="modal-actions">
              <button className="confirm-button" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Confirm'}
              </button>
              <button className="cancel-button" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {showToast && (
        <div
          className={`toast ${toastType}`}
          style={{
            position: 'fixed',
            top: '2rem',
            right: '2rem',
            backgroundColor: toastType === 'success' ? '#4caf50' : '#f44336',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            zIndex: 9999,
            fontSize: '1rem',
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default CrewProfileSection;