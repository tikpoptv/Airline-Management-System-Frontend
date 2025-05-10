import { useParams, useNavigate } from 'react-router-dom';
import { FaPlane, FaEdit, FaArrowLeft, FaSave, FaTimes } from 'react-icons/fa';
import { useState } from 'react';
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
                <button className="edit-button" onClick={handleSave}><FaSave /> Save</button>
                <button className="edit-button cancel" onClick={handleCancel}><FaTimes /> Cancel</button>
              </>
            ) : (
              <button className="edit-button" onClick={() => setIsEditing(true)}><FaEdit /> Edit</button>
            )}
            <span className={`status-badge ${log.status.toLowerCase().replace(' ', '-')}`}>{log.status}</span>
          </div>

          <div className="info-grid">
            <div>
              <strong>Aircraft ID:</strong><br />
              {isEditing ? <input name="aircraftId" value={formData?.aircraftId} onChange={handleChange} /> : log.aircraftId}
            </div>
            <div>
              <strong>Model:</strong><br />
              {isEditing ? <input name="model" value={formData?.model} onChange={handleChange} /> : log.model}
            </div>
            <div>
              <strong>User ID:</strong><br />
              {isEditing ? <input name="userId" value={formData?.userId} onChange={handleChange} /> : log.userId}
            </div>
            <div>
              <strong>User name:</strong><br />
              {isEditing ? <input name="userName" value={formData?.userName} onChange={handleChange} /> : log.userName}
            </div>
            <div>
              <strong>Location:</strong><br />
              {isEditing ? <input name="location" value={formData?.location} onChange={handleChange} /> : log.location}
            </div>
            <div>
              <strong>Date of maintenance:</strong><br />
              {isEditing ? <input type="date" name="date" value={formData?.date} onChange={handleChange} /> : log.date}
            </div>
          </div>

          <div className="details-section">
            <strong>Details:</strong>
            {isEditing ? (
              <textarea name="details" value={formData?.details} onChange={handleChange} />
            ) : (
              <p>{log.details}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaintenanceDetail;
