import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaClock, FaMapMarkerAlt, FaPlane, FaUser, FaInfoCircle, FaEdit, FaTools } from 'react-icons/fa';
import './MaintenanceDetail.css';
import { MaintenanceLog } from '../../../types/maintenance';
import { getMaintenanceLogDetail } from '../../../services/maintenance/maintenanceService';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

const MaintenanceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [maintenance, setMaintenance] = useState<MaintenanceLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaintenanceDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getMaintenanceLogDetail(id);
        setMaintenance(data);
      } catch (err) {
        console.error('Error fetching maintenance detail:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch maintenance detail');
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceDetail();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleEdit = () => {
    navigate(`/admin/maintenance/edit/${id}`);
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
        <h1>Maintenance Log Details</h1>
        <div className="header-actions">
          <button 
            className="maintenance-detail-back-btn"
            onClick={() => navigate('/admin/maintenance')}
          >
            <FaArrowLeft /> Back to List
          </button>
          <button 
            className="edit-button"
            onClick={handleEdit}
          >
            <FaEdit /> Edit
          </button>
        </div>
      </div>

      <div className="maintenance-detail-card">
        <div className="maintenance-detail-status">
          <span className={`status-badge ${maintenance.status.toLowerCase().replace(' ', '-')}`}>
            {maintenance.status}
          </span>
        </div>

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
              <span className="detail-value">{maintenance.maintenance_location}</span>
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
              onClick={() => navigate(`/admin/aircrafts/${maintenance.aircraft?.aircraft_id}`)}
              disabled={!maintenance.aircraft?.aircraft_id}
              title={!maintenance.aircraft?.aircraft_id ? 'No aircraft information available' : ''}
            >
              <FaPlane /> View Aircraft Details
            </button>
          </div>

          <div className="detail-section">
            <h2><FaUser /> Assignment Information</h2>
            <div className="detail-item">
              <span className="detail-label">Assigned To</span>
              <span className="detail-value">{maintenance.assigned_user?.username || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">User ID</span>
              <span className="detail-value">{maintenance.assigned_user?.user_id || 'N/A'}</span>
            </div>
            <button 
              className="view-details-button view-crew-button"
              onClick={() => navigate(`/admin/crew/${maintenance.assigned_user?.user_id}`)}
              disabled={!maintenance.assigned_user?.user_id}
              title={!maintenance.assigned_user?.user_id ? 'No crew member assigned' : ''}
            >
              <FaUser /> View Crew Details
            </button>
          </div>
        </div>

        <div className="maintenance-details">
          <h2><FaTools /> Maintenance Details</h2>
          <p className="detail-text">{maintenance.details || 'No details provided'}</p>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDetail; 