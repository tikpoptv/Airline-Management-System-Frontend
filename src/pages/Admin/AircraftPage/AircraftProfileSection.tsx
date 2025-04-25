import { useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { Aircraft } from '../../../types/aircraft';
import avatarImg from '../../../assets/images/resize.webp';
import { updateAircraftById } from '../../../services/aircraft/aircraftService';



interface Props {
  editData: Aircraft;
  originalData: Aircraft;
  isEditMode: boolean;
  handleChange: <K extends keyof Aircraft>(field: K, value: Aircraft[K]) => void;
  onDelete: () => void;
}

const AircraftProfileSection = ({
  editData,
  originalData,
  isEditMode,
  handleChange,
  onDelete,
}: Props) => {

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [saving, setSaving] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const confirmSave = async () => {
    setSaving(true);
    try {
      const response = await updateAircraftById(editData.aircraft_id, {
        model: editData.model,
        maintenance_status: editData.maintenance_status,
        aircraft_history: editData.aircraft_history,
      });

      if (response && response.success !== false) {
        triggerToast("✅ Aircraft updated successfully!");
        setShowConfirmModal(false);
      } else {
        triggerToast("❌ Update failed: Unexpected server response.");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        triggerToast("❌ Update failed: " + error.message);
      } else {
        triggerToast("❌ Update failed: Unknown error");
      }
    } finally {
      setSaving(false);
    }
  };



  return (
    <div className="profile-wrapper">
      <div className="form-grid">
        {/* Row 1: Avatar + Aircraft ID + Trash */}
        <div className="avatar-cell">
          <div className="profile-avatar">
            <img src={avatarImg} alt="avatar" />
          </div>
        </div>


        <div className="aircraft-id-group">
          <label>Aircraft ID</label>
          <div className="input-with-icon">
            <div className="read-only-field">{editData.aircraft_id}</div>
            {isEditMode && (
              <button className="delete-button" onClick={onDelete}>
                <FaTrash />
              </button>
            )}
          </div>
        </div>


        {/* Row 2: Airline Owner + Maintenance Status */}
        <div className="input-group airline-owner">
          <label>Airline Owner</label>
          {isEditMode ? (
            <input
              type="text"
              value={editData.airline_owner}
              onChange={(e) => handleChange('airline_owner', e.target.value)}
            />
          ) : (
            <div className="read-only-field">{editData.airline_owner}</div>
          )}
        </div>


        <div className="input-group maintenance-status">
          <label>Maintenance Status</label>
          {isEditMode ? (
            <select
              value={editData.maintenance_status}
              onChange={(e) =>
                handleChange('maintenance_status', e.target.value as Aircraft['maintenance_status'])
              }
            >
              <option value="Operational">Operational</option>
              <option value="In Maintenance">In Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
          ) : (
            <div className="read-only-field">{editData.maintenance_status}</div>
          )}
        </div>

        {/* Row 3: Model Name + Capacity + Year */}
        <div className="input-group">
          <label>Model Name</label>
          {isEditMode ? (
            <input
              value={editData.model}
              onChange={(e) => handleChange('model', e.target.value)}
            />
          ) : (
            <div className="read-only-field">{editData.model}</div>
          )}
        </div>

        <div className="input-group">
          <label>Capacity</label>
          {isEditMode ? (
            <input
              type="number"
              value={editData.capacity}
              onChange={(e) => handleChange('capacity', Number(e.target.value))}
            />
          ) : (
            <div className="read-only-field">{editData.capacity}</div>
          )}
        </div>

        <div className="input-group">
          <label>Manufacture Year</label>
          {isEditMode ? (
            <input
              type="number"
              value={editData.manufacture_year}
              onChange={(e) => handleChange('manufacture_year', Number(e.target.value))}
            />
          ) : (
            <div className="read-only-field">{editData.manufacture_year}</div>
          )}
        </div>

        {/* Row 4: Aircraft History */}
        <div className="input-group aircraft-history">
          <label>Aircraft History</label>
          {isEditMode ? (
            <textarea
              value={editData.aircraft_history}
              onChange={(e) => handleChange('aircraft_history', e.target.value)}
            />
          ) : (
            <div className="read-only-field">{editData.aircraft_history}</div>
          )}
        </div>

        {/* Save Button */}
        {isEditMode && (
          <div className="save-button-cell">
            <button className="save-button" onClick={() => setShowConfirmModal(true)}>
              Save Changes
            </button>

          </div>
        )}

        {showConfirmModal && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <h3>Confirm Edit Aircraft</h3>
              <div className="modal-diff">
                {editData.maintenance_status !== originalData.maintenance_status && (
                  <p>
                    <strong>Maintenance Status:</strong>{' '}
                    {originalData.maintenance_status} → {editData.maintenance_status}
                  </p>
                )}
                {editData.aircraft_history !== originalData.aircraft_history && (
                  <p>
                    <strong>Aircraft History:</strong>{' '}
                    {originalData.aircraft_history || '—'} → {editData.aircraft_history || '—'}
                  </p>
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


      </div>
      {showToast && (
        <div className="toast">
          {toastMessage}
        </div>
      )}

    </div>

  );
};

export default AircraftProfileSection;
