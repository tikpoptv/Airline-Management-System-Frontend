import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useMaintenance } from './context/MaintenanceContext';
import { FaPlane, FaEdit } from 'react-icons/fa';
import './CreateMaintenance.css';

function CreateMaintenance() {
  const navigate = useNavigate();
  const { logs, addLog } = useMaintenance();

  const [form, setForm] = useState({
    id: String(logs.length + 1),
    aircraftId: '',
    model: '',
    userId: '',
    userName: '',
    location: '',
    date: '',
    status: 'Pending',
    details: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    addLog(form);
    navigate('/maintenance/maintenance');
  };

  const handleCancel = () => {
    navigate('/maintenance/maintenance');
  };

  return (
    <div className="maintenance-detail-container">
      <div className="maintenance-detail-header">
        <h2>Maintenance</h2>
        <div className="header">
          <button className="edit-button" onClick={handleSubmit}>
            <FaEdit /> Edit
          </button>
          <span className={`status ${form.status.toLowerCase().replace(' ', '-')}`}>
            {form.status}
          </span>
        </div>
      </div>

      <div className="detail-card">
        <div className="left-section">
          <FaPlane className="plane-icon" />
          <div className="log-id">Log ID: {form.id}</div>
        </div>

        <div className="right-section">
          <div className="info-grid">
            <div className="detail-item">
              <label>Aircraft ID:</label>
              <input
                name="aircraftId"
                value={form.aircraftId}
                onChange={handleChange}
              />
            </div>
            <div className="detail-item">
              <label>Model:</label>
              <input
                name="model"
                value={form.model}
                onChange={handleChange}
              />
            </div>
            <div className="detail-item">
              <label>User ID:</label>
              <input
                name="userId"
                value={form.userId}
                onChange={handleChange}
              />
            </div>
            <div className="detail-item">
              <label>User name:</label>
              <input
                name="userName"
                value={form.userName}
                onChange={handleChange}
              />
            </div>
            <div className="detail-item">
              <label>Location:</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
              />
            </div>
            <div className="detail-item">
              <label>Date of maintenance:</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
            </div>
            <div className="detail-item full-width">
              <label>Details:</label>
              <textarea
                name="details"
                value={form.details}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-buttons">
            <button className="done-btn" onClick={handleSubmit}>
              DONE
            </button>
            <button className="exit-btn" onClick={handleCancel}>
              EXIT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateMaintenance;