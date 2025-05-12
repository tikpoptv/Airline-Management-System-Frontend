import { useState, useEffect } from 'react';
import { Aircraft, AircraftModel, AirlineModel } from '../../../types/aircraft';
import { createAircraft, getAircraftModels, getAirlineModels } from '../../../services/aircraft/aircraftService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateAircraftModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const [formData, setFormData] = useState<Omit<Aircraft, 'aircraft_id'>>({
    model: '',
    manufacture_year: new Date().getFullYear(),
    capacity: 0,
    airline_owner: '',
    maintenance_status: 'Operational',
    aircraft_history: '',
  });

  const [modelOptions, setModelOptions] = useState<AircraftModel[]>([]);
  const [airlineOptions, setAirlineOptions] = useState<AirlineModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen]);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const [models, airlines] = await Promise.all([
        getAircraftModels(),
        getAirlineModels(),
      ]);
      setModelOptions(models);
      setAirlineOptions(airlines);
    } catch (error) {
      console.error('Failed to fetch options:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const currentYear = new Date().getFullYear();

    if (!formData.model) newErrors.model = 'Please select a model';
    if (!formData.airline_owner) newErrors.airline_owner = 'Please select an airline';
    if (!formData.maintenance_status) newErrors.maintenance_status = 'Please select maintenance status';
    if (formData.capacity <= 0) newErrors.capacity = 'Capacity must be greater than 0';
    if (formData.manufacture_year < 1950 || formData.manufacture_year > currentYear) {
      newErrors.manufacture_year = `Manufacture year must be between 1950 and ${currentYear}`;
    }

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
      await createAircraft(formData);
      setToastMessage('Aircraft created successfully!');
      setToastType('success');
      setShowToast(true);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating aircraft:', error);
      setToastMessage('Failed to create aircraft');
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
        <h2>Create New Aircraft</h2>

        <div className="form-grid">
          {/* Model Name */}
          <div className="input-group">
            <label>Model Name</label>
            <select
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className={errors.model ? 'error' : ''}
            >
              <option value="">Select Model</option>
              {modelOptions.map((model) => (
                <option key={model.model_id} value={model.model_name}>
                  {model.model_name}
                </option>
              ))}
            </select>
            {errors.model && <span className="error-message">{errors.model}</span>}
          </div>

          {/* Airline Owner */}
          <div className="input-group">
            <label>Airline Owner</label>
            <select
              value={formData.airline_owner}
              onChange={(e) => setFormData({ ...formData, airline_owner: e.target.value })}
              className={errors.airline_owner ? 'error' : ''}
            >
              <option value="">Select Airline</option>
              {airlineOptions.map((airline) => (
                <option key={airline.id} value={airline.name}>
                  {airline.name}
                </option>
              ))}
            </select>
            {errors.airline_owner && <span className="error-message">{errors.airline_owner}</span>}
          </div>

          {/* Maintenance Status */}
          <div className="input-group">
            <label>Maintenance Status</label>
            <select
              value={formData.maintenance_status}
              onChange={(e) => setFormData({ ...formData, maintenance_status: e.target.value as Aircraft['maintenance_status'] })}
              className={errors.maintenance_status ? 'error' : ''}
            >
              <option value="Operational">Operational</option>
              <option value="In Maintenance">In Maintenance</option>
              <option value="Retired">Retired</option>
            </select>
            {errors.maintenance_status && <span className="error-message">{errors.maintenance_status}</span>}
          </div>

          {/* Capacity */}
          <div className="input-group">
            <label>Capacity</label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              className={errors.capacity ? 'error' : ''}
            />
            {errors.capacity && <span className="error-message">{errors.capacity}</span>}
          </div>

          {/* Manufacture Year */}
          <div className="input-group">
            <label>Manufacture Year</label>
            <input
              type="number"
              value={formData.manufacture_year}
              onChange={(e) => setFormData({ ...formData, manufacture_year: Number(e.target.value) })}
              className={errors.manufacture_year ? 'error' : ''}
            />
            {errors.manufacture_year && <span className="error-message">{errors.manufacture_year}</span>}
          </div>

          {/* Aircraft History */}
          <div className="input-group aircraft-history">
            <label>Aircraft History</label>
            <textarea
              value={formData.aircraft_history}
              onChange={(e) => setFormData({ ...formData, aircraft_history: e.target.value })}
            />
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
            <h3>Confirm Create Aircraft</h3>
            <p>Are you sure you want to create this aircraft?</p>

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

export default CreateAircraftModal; 