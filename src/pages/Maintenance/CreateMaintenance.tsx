import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useMaintenance } from './context/MaintenanceContext';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    <div className="create-maintenance-container">
      <div className="breadcrumb">Maintenance &gt; Log ID &gt; Edit</div>
      <h2>Maintenance</h2>

      <div className="form-card">
        <div className="form-header">
          <div className="form-title">Frame {form.id}</div>
          <select name="status" value={form.status} onChange={handleChange} className="status-dropdown">
            <option value="Pending">Pending</option>
            <option value="In progress">In progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="form-grid">
          <input name="aircraftId" placeholder="Aircraft_ID" value={form.aircraftId} onChange={handleChange} />
          <input name="model" placeholder="Model" value={form.model} onChange={handleChange} />
          <input name="userId" placeholder="User_ID" value={form.userId} onChange={handleChange} />
          <input name="userName" placeholder="User_name" value={form.userName} onChange={handleChange} />
          <input name="location" placeholder="Location" value={form.location} onChange={handleChange} />
          <input name="date" type="date" placeholder="Date of maintenance" value={form.date} onChange={handleChange} />
        </div>

        <textarea
          name="details"
          placeholder="Details"
          value={form.details}
          onChange={handleChange}
          className="details-textarea"
        />

        <div className="form-buttons">
          <button className="done-btn" onClick={handleSubmit}>DONE</button>
          <button className="exit-btn" onClick={handleCancel}>EXIT</button>
        </div>
      </div>
    </div>
  );
}

export default CreateMaintenance;
