import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaClock, FaMapMarkerAlt, FaPlane, FaUser, FaInfoCircle, FaSave, FaTools } from 'react-icons/fa';
import './EditMaintenance.css';
import { MaintenanceLog } from '../../../types/maintenance';
import { getMaintenanceLogDetail, updateMaintenanceLog } from '../../../services/maintenance/maintenanceService';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import { Select, Input, message } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

type MaintenanceStatus = 'Pending' | 'In Progress' | 'Completed';

const statusOptions: { value: MaintenanceStatus; label: string }[] = [
  { value: 'Pending', label: 'Pending' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' }
];

const EditMaintenance: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [maintenance, setMaintenance] = useState<MaintenanceLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [status, setStatus] = useState<MaintenanceStatus>('Pending');
  const [location, setLocation] = useState<string>('');
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [details, setDetails] = useState<string>('');

  useEffect(() => {
    const fetchMaintenanceDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getMaintenanceLogDetail(id);
        setMaintenance(data);
        
        // Initialize form values
        setStatus(data.status as MaintenanceStatus);
        setLocation(data.maintenance_location);
        setAssignedTo(data.assigned_user?.user_id || null);
        setDetails(data.details || '');
      } catch (err) {
        console.error('Error fetching maintenance detail:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch maintenance detail');
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceDetail();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;

    try {
      setSaving(true);
      setError(null);

      const updateData = {
        status: status as MaintenanceStatus,
        maintenance_location: location,
        details: details,
        ...(assignedTo && { assigned_to: assignedTo })
      };

      await updateMaintenanceLog(id, updateData);
      message.success('Maintenance log updated successfully');
      navigate(`/admin/maintenance/${id}`);
    } catch (err) {
      console.error('Error updating maintenance:', err);
      setError(err instanceof Error ? err.message : 'Failed to update maintenance log');
      message.error('Failed to update maintenance log');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !maintenance) {
    return (
      <div className="maintenance-detail-error">
        <h2>Error</h2>
        <p>{error || 'Maintenance log not found'}</p>
        <button 
          className="back-to-list-button"
          onClick={() => navigate('/admin/maintenance')}
        >
          <FaArrowLeft /> Back to Maintenance List
        </button>
      </div>
    );
  }

  return (
    <div className="maintenance-detail-container">
      <div className="maintenance-detail-header">
        <h1>Edit Maintenance Log</h1>
        <div className="header-actions">
          <button 
            className="maintenance-detail-back-btn"
            onClick={() => navigate(`/admin/maintenance/${id}`)}
          >
            <FaArrowLeft /> Back to Details
          </button>
          <button 
            className="save-button"
            onClick={handleSave}
            disabled={saving}
          >
            <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="maintenance-detail-card">
        <div className="maintenance-detail-grid">
          <div className="detail-section">
            <h2><FaInfoCircle /> Basic Information</h2>
            <div className="detail-item">
              <span className="detail-label">Log ID</span>
              <span className="detail-value">{maintenance.log_id}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">
                <FaClock /> Date
              </span>
              <span className="detail-value">
                {formatDate(maintenance.date_of_maintenance)}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">
                <FaMapMarkerAlt /> Location
              </span>
              <div className="detail-value editable">
                <Input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="Enter location"
                />
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h2><FaPlane /> Aircraft Information</h2>
            <div className="detail-item">
              <span className="detail-label">Aircraft ID</span>
              <span className="detail-value">{maintenance.aircraft?.aircraft_id}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Model</span>
              <span className="detail-value">{maintenance.aircraft?.model || 'N/A'}</span>
            </div>
            <button 
              className="view-details-button"
              disabled={true}
              title="Cannot view aircraft details while editing"
            >
              <FaPlane /> View Aircraft Details
            </button>
          </div>

          <div className="detail-section">
            <h2><FaUser /> Assignment Information</h2>
            <div className="detail-item">
              <span className="detail-label">Status</span>
              <div className="detail-value editable">
                <Select
                  value={status}
                  onChange={value => setStatus(value as MaintenanceStatus)}
                  style={{ width: '100%' }}
                >
                  {statusOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="detail-item">
              <span className="detail-label">Assigned To (ID)</span>
              <div className="detail-value editable">
                <Input
                  type="number"
                  value={assignedTo || ''}
                  onChange={e => setAssignedTo(e.target.value ? Number(e.target.value) : null)}
                  placeholder="Enter crew member ID"
                />
              </div>
            </div>
          </div>

          <div className="maintenance-details">
            <h2><FaTools /> Maintenance Details</h2>
            <div className="detail-value editable">
              <TextArea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Enter maintenance details"
                autoSize={{ minRows: 3, maxRows: 6 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMaintenance; 