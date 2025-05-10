import {  useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { MaintenanceLog } from '../../../types/maintenance';
import { updateMaintenanceLog, cancelMaintenanceLog } from '../../../services/maintenance/maintenanceService';
import { useNavigate } from 'react-router-dom';
import avatarImg from "../../../assets/images/profile_web.webp"
interface Props {
  editData: MaintenanceLog;
  originalData: MaintenanceLog;
  isEditMode: boolean;
  handleChange: <K extends keyof MaintenanceLog>(field: K, value: MaintenanceLog[K]) => void;
}

const MaintenanceProfileSection = ({
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
      await updateMaintenanceLog(editData.log_id, {
        aircraft_id: editData.aircraft_id,
        date_of_maintenance: editData.date_of_maintenance,
        details: editData.details,
        maintenance_location: editData.maintenance_location,
        status: editData.status,
        assigned_to: editData.assigned_user?.user_id,
      });

      triggerToast("✅ Maintenance log updated successfully!", 'success');
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
      await cancelMaintenanceLog(editData.log_id);
      triggerToast("✅ Maintenance log cancelled successfully!", 'success');
      navigate('/admin/maintenance');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error occurred';
      triggerToast("❌ Cancel failed: " + message, 'error');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="profile-wrapper">
      <div className="form-container">
        {/* Profile Avatar Section */}
        <div className="avatar-section">
          <div className="profile-avatar">
            <img src={avatarImg} alt="avatar" />
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="profile-content">
          {/* Work Section */}
          <div className="section work-section">
            <h2>Maintenance Details</h2>
            <div className="field-group">
              <label>Status</label>
              {isEditMode ? (
                <select
                  value={editData.status}
                  onChange={(e) => handleChange('status', e.target.value as MaintenanceLog['status'])}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              ) : (
                <div className="read-only-field">{editData.status}</div>
              )}
            </div>

            <div className="field-group">
              <label>Log ID</label>
              <div className="input-with-icon">
                <div className="read-only-field">{editData.log_id}</div>
                {isEditMode && (
                  <button className="delete-button" onClick={() => setShowDeleteConfirm(true)}>
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>

            <div className="field-group">
              <label>Aircraft ID</label>
              {isEditMode ? (
                <input
                  type="number"
                  value={editData.aircraft_id}
                  onChange={(e) => handleChange('aircraft_id', Number(e.target.value))}
                />
              ) : (
                <div className="read-only-field">{editData.aircraft_id}</div>
              )}
            </div>
          </div>

          {/* Information Section */}
          <div className="section information-section">
            <h2>Information</h2>
            <div className="field-row">
              <div className="field-group">
                <label>Date of Maintenance</label>
                {isEditMode ? (
                  <input
                    type="datetime-local"
                    value={editData.date_of_maintenance}
                    onChange={(e) => handleChange('date_of_maintenance', e.target.value)}
                  />
                ) : (
                  <div className="read-only-field">{new Date(editData.date_of_maintenance).toLocaleString()}</div>
                )}
              </div>
              
              <div className="field-group">
                <label>Location</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editData.maintenance_location}
                    onChange={(e) => handleChange('maintenance_location', e.target.value)}
                  />
                ) : (
                  <div className="read-only-field">{editData.maintenance_location}</div>
                )}
              </div>
            </div>

            <div className="field-group full-width">
              <label>Details</label>
              {isEditMode ? (
                <textarea
                  value={editData.details}
                  onChange={(e) => handleChange('details', e.target.value)}
                />
              ) : (
                <div className="read-only-field">{editData.details}</div>
              )}
            </div>
          </div>

          {/* Assigned User Section */}
          <div className="section contact-section">
            <h2>Assigned User</h2>
            <div className="field-row">
              <div className="field-group">
                <label>User ID</label>
                <div className="read-only-field">{editData.assigned_user?.user_id || 'N/A'}</div>
              </div>
              
              <div className="field-group">
                <label>Username</label>
                <div className="read-only-field">{editData.assigned_user?.username || 'N/A'}</div>
              </div>
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

      {/* Modals */}
      {showConfirmModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Confirm Edit Maintenance Log</h3>
            <div className="modal-diff">
              {editData.status !== originalData.status && (
                <p><strong>Status:</strong> {originalData.status} → {editData.status}</p>
              )}
              {editData.aircraft_id !== originalData.aircraft_id && (
                <p><strong>Aircraft ID:</strong> {originalData.aircraft_id} → {editData.aircraft_id}</p>
              )}
              {editData.date_of_maintenance !== originalData.date_of_maintenance && (
                <p><strong>Date:</strong> {new Date(originalData.date_of_maintenance).toLocaleString()} → {new Date(editData.date_of_maintenance).toLocaleString()}</p>
              )}
              {editData.maintenance_location !== originalData.maintenance_location && (
                <p><strong>Location:</strong> {originalData.maintenance_location} → {editData.maintenance_location}</p>
              )}
              {editData.details !== originalData.details && (
                <p><strong>Details:</strong> {originalData.details} → {editData.details}</p>
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
            <h3>Confirm Cancel Maintenance Log</h3>
            <p>Are you sure you want to cancel Maintenance Log ID: {editData.log_id}?</p>
            <div className="modal-actions">
              <button className="confirm-button" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Cancelling...' : 'Confirm'}
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

export default MaintenanceProfileSection;