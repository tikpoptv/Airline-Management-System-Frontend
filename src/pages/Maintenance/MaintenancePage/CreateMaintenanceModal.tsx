import { useState } from 'react';
import { MaintenanceLog, CreateMaintenanceLogPayload } from '../../../types/maintenance';
import { createMaintenanceLog } from '../../../services/maintenance/maintenanceService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateMaintenanceModal = ({ isOpen, onClose, onSuccess }: Props) => {
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

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

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setShowConfirmModal(true);
  };

  const confirmCreate = async () => {
    setSaving(true);
    try {
      await createMaintenanceLog(formData);
      setToastMessage('Maintenance log created successfully!');
      setToastType('success');
      setShowToast(true);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating maintenance log:', error);
      setToastMessage('Failed to create maintenance log');
      setToastType('error');
      setShowToast(true);
    } finally {
      setSaving(false);
      setShowConfirmModal(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Create New Maintenance Log</h2>

        <div className="form-grid">
          <div className="form-row">
            {/* Aircraft ID */}
            <div className="input-group">
              <label>Aircraft ID</label>
              <input
                type="number"
                value={formData.aircraft_id}
                onChange={(e) => setFormData({ ...formData, aircraft_id: Number(e.target.value) })}
                className={errors.aircraft_id ? 'error' : ''}
              />
              {errors.aircraft_id && <span className="error-message">{errors.aircraft_id}</span>}
            </div>

            {/* Date of Maintenance */}
            <div className="input-group">
              <label>Date of Maintenance</label>
              <input
                type="datetime-local"
                value={formData.date_of_maintenance.slice(0, 16)}
                onChange={(e) => setFormData({ ...formData, date_of_maintenance: new Date(e.target.value).toISOString() })}
                className={errors.date_of_maintenance ? 'error' : ''}
              />
              {errors.date_of_maintenance && <span className="error-message">{errors.date_of_maintenance}</span>}
            </div>
          </div>

          <div className="form-row">
            {/* Maintenance Location */}
            <div className="input-group">
              <label>Maintenance Location</label>
              <input
                type="text"
                value={formData.maintenance_location}
                onChange={(e) => setFormData({ ...formData, maintenance_location: e.target.value })}
                className={errors.maintenance_location ? 'error' : ''}
              />
              {errors.maintenance_location && <span className="error-message">{errors.maintenance_location}</span>}
            </div>

            {/* Status */}
            <div className="input-group">
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
            {/* User ID */}
            <div className="input-group">
              <label>User ID</label>
              <input
                type="number"
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: Number(e.target.value) })}
                className={errors.assigned_to ? 'error' : ''}
                placeholder="Enter User ID"
              />
              {errors.assigned_to && <span className="error-message">{errors.assigned_to}</span>}
            </div>
          </div>

          {/* Details */}
          <div className="form-row">
            <div className="input-group maintenance-details">
              <label>Maintenance Details</label>
              <textarea
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                className={errors.details ? 'error' : ''}
              />
              {errors.details && <span className="error-message">{errors.details}</span>}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="confirm-button" onClick={handleSubmit} disabled={loading || saving}>
            Create
          </button>
          <button className="cancel-button" onClick={onClose} disabled={loading || saving}>
            Cancel
          </button>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Confirm Create Maintenance Log</h3>
            <p>Are you sure you want to create this maintenance log?</p>

            <div className="modal-actions">
              <button className="confirm-button" onClick={confirmCreate} disabled={saving}>
                {saving ? 'Creating...' : 'Confirm'}
              </button>
              <button className="cancel-button" onClick={() => setShowConfirmModal(false)} disabled={saving}>
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Message */}
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
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            zIndex: 9999,
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default CreateMaintenanceModal; 