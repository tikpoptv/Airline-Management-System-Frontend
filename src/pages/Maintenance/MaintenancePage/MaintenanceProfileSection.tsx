import {  useState } from 'react';
import { MaintenanceLog } from '../../../types/maintenance';
import { updateMaintenanceLog, cancelMaintenanceLog } from '../../../services/maintenance/maintenanceService';
import { useNavigate } from 'react-router-dom';
import avatarImg from "../../../assets/images/maintenance.webp"
import styles from './MaintenanceDetail.module.css';

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
      navigate('/maintenance/maintenance');
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
    <div className={`${styles.profileWrapper} ${isEditMode ? styles.isEditMode : ''}`}>
      <div className={styles.formContainer}>
        {/* Status Badge */}
        <div className={styles.statusBadgeContainer}>
          {isEditMode ? (
            <select
              value={editData.status}
              onChange={(e) => handleChange('status', e.target.value as MaintenanceLog['status'])}
              className={`${styles.statusBadge} ${styles.statusSelect} ${styles[`statusSelect${editData.status.replace(/\s+/g, '')}`]}`}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          ) : (
            <div className={`${styles.statusBadge} ${styles[`statusBadge${editData.status.replace(/\s+/g, '')}`]}`}>
              {editData.status}
            </div>
          )}
        </div>

        {/* Left Column - Avatar and Work Section */}
        <div className={styles.leftColumn}>
          <div className={styles.avatarSection}>
            <div className={styles.profileAvatar}>
              <img src={avatarImg} alt="avatar" />
            </div>
          </div>

          <div className={`${styles.section} ${styles.workSection}`}>
            <h2>Maintenance Details</h2>
            
            <div className={styles.fieldGroup}>
              <label>Log ID</label>
              <div className={styles.inputGroup}>
                <div className={styles.readOnlyField}>{editData.log_id}</div>
              </div>
            </div>

            <div className={styles.fieldGroup}>
                <label>Aircraft ID</label>
                <div className={styles.readOnlyField}>{editData.aircraft_id}</div>
              </div>
          </div>
        </div>

        {/* Right Column - Information and Contact Sections */}
        <div className={styles.rightColumn}>
          {/* Information Section */}
          <div className={`${styles.section} ${styles.informationSection}`}>
            <h2>Information</h2>

            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label>Aircraft ID</label>
                <div className={styles.readOnlyField}>{editData.aircraft_id}</div>
              </div>
              
              <div className={styles.fieldGroup}>
                <label>Aircraft Model</label>
                <div className={styles.readOnlyField}>{editData.aircraft?.model || 'N/A'}</div>
              </div>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label>User ID</label>
                {isEditMode ? (
                  <input
                    type="number"
                    value={editData.assigned_user?.user_id || ''}
                    onChange={(e) => {
                      const user_id = Number(e.target.value);
                      handleChange('assigned_user', {
                        user_id,
                        username: editData.assigned_user?.username || ''
                      });
                    }}
                    placeholder="Enter User ID"
                  />
                ) : (
                  <div className={styles.readOnlyField}>{editData.assigned_user?.user_id || 'N/A'}</div>
                )}
              </div>
              
              <div className={styles.fieldGroup}>
                <label>Username</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editData.assigned_user?.username || ''}
                    onChange={(e) => {
                      handleChange('assigned_user', {
                        user_id: editData.assigned_user?.user_id || 0,
                        username: e.target.value
                      });
                    }}
                    placeholder="Enter Username"
                  />
                ) : (
                  <div className={styles.readOnlyField}>{editData.assigned_user?.username || 'N/A'}</div>
                )}
              </div>
            </div>

            
            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label>Location</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editData.maintenance_location}
                    onChange={(e) => handleChange('maintenance_location', e.target.value)}
                  />
                ) : (
                  <div className={styles.readOnlyField}>{editData.maintenance_location}</div>
                )}
              </div>
              <div className={styles.fieldGroup}>
                <label>Date of Maintenance</label>
                  <div className={styles.readOnlyField}>{new Date(editData.date_of_maintenance).toLocaleString()}</div>
              </div>
            </div>

          </div>

          {/* Assigned User Section */}
          <div className={`${styles.section} ${styles.contactSection}`}>
            <h2>Description</h2>
            <div className={`${styles.fieldGroup} ${styles.fieldGroupFullWidth}`}>
              <label>Details</label>
              {isEditMode ? (
                <textarea
                  value={editData.details}
                  onChange={(e) => handleChange('details', e.target.value)}
                />
              ) : (
                <div className={styles.readOnlyField}>{editData.details}</div>
              )}
            </div>
          </div>

          {/* Save Button (when in edit mode) */}
          {isEditMode && (
            <div className={styles.saveButtonContainer}>
              <button className={styles.saveButton} onClick={() => setShowConfirmModal(true)}>
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showConfirmModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h3>Confirm Edit Maintenance Log</h3>
            <div className={styles.modalDiff}>
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
            <div className={styles.modalActions}>
              <button className={styles.confirmButton} onClick={confirmSave} disabled={saving}>
                {saving ? 'Saving...' : 'Confirm'}
              </button>
              <button className={styles.cancelButton} onClick={() => setShowConfirmModal(false)} disabled={saving}>
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h3>Confirm Cancel Maintenance Log</h3>
            <p>Are you sure you want to cancel Maintenance Log ID: {editData.log_id}?</p>
            <div className={styles.modalActions}>
              <button className={styles.confirmButton} onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Cancelling...' : 'Confirm'}
              </button>
              <button className={styles.cancelButton} onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {showToast && (
        <div
          className={`${styles.toast} ${styles[toastType]}`}
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