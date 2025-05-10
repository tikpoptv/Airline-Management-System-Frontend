import { useParams, useNavigate } from 'react-router-dom';
import { FaPlane, FaEdit, FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { useState } from 'react';
import { useMaintenance } from './context/MaintenanceContext';
import './MaintenanceDetail.css';

function MaintenanceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logs, updateLog } = useMaintenance();

  const log = logs.find((item) => item.id === id);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(log || null);

  if (!log) {
    return <div className="maintenance-detail-container">Log ID {id} not found.</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    if (formData) {
      updateLog(formData.id, formData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData(log);
    setIsEditing(false);
  };

  return (
    <div className="maintenance-detail-container">
      <button className="back-button" onClick={() => navigate('/maintenance/maintenance')}>
        <FaArrowLeft /> Back to list
      </button>

      <div className="breadcrumb">Maintenance &gt; Log ID {log.id}</div>
      <h1>Maintenance</h1>

      <div className="detail-card">
        <div className="left-section">
          <FaPlane className="plane-icon" />
          <div className="log-id">Log ID: {log.id}</div>
        </div>

        <div className="right-section">
          <div className="header">
            {isEditing ? (
              <>
                <button className="edit-button" onClick={handleSave}>
                  <FaSave /> Save
                </button>
                <button className="edit-button cancel" onClick={handleCancel}>
                  <FaTimes /> Cancel
                </button>
              </>
            ) : (
              <button className="edit-button" onClick={() => setIsEditing(true)}>
                <FaEdit /> Edit
              </button>
            )}
            <span className={`status ${log.status.toLowerCase().replace(' ', '-')}`}>{log.status}</span>
          </div>

          <div className="info-grid">
            <div className="detail-item">
              <label>Aircraft ID:</label>
              {isEditing ? (
                <input name="aircraftId" value={formData?.aircraftId} onChange={handleChange} />
              ) : (
                <p>{log.aircraftId}</p>
              )}
            </div>
            <div className="detail-item">
              <label>Model:</label>
              {isEditing ? (
                <input name="model" value={formData?.model} onChange={handleChange} />
              ) : (
                <p>{log.model}</p>
              )}
            </div>
            <div className="detail-item">
              <label>User ID:</label>
              {isEditing ? (
                <input name="userId" value={formData?.userId} onChange={handleChange} />
              ) : (
                <p>{log.userId}</p>
              )}
            </div>
            <div className="detail-item">
              <label>User name:</label>
              {isEditing ? (
                <input name="userName" value={formData?.userName} onChange={handleChange} />
              ) : (
                <p>{log.userName}</p>
              )}
            </div>
            <div className="detail-item">
              <label>Location:</label>
              {isEditing ? (
                <input name="location" value={formData?.location} onChange={handleChange} />
              ) : (
                <p>{log.location}</p>
              )}
            </div>
            <div className="detail-item">
              <label>Date of maintenance:</label>
              {isEditing ? (
                <input type="date" name="date" value={formData?.date} onChange={handleChange} />
              ) : (
                <p>{log.date}</p>
              )}
            </div>
            <div className="detail-item full-width">
              <label>Details:</label>
              {isEditing ? (
                <textarea name="details" value={formData?.details} onChange={handleChange} />
              ) : (
                <p>{log.details}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaintenanceDetail;