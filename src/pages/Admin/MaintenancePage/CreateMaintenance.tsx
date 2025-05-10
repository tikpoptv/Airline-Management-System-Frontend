import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaClock, FaMapMarkerAlt, FaPlane, FaUser, FaInfoCircle, FaSave } from 'react-icons/fa';
import './CreateMaintenance.css';
import { createMaintenanceLog } from '../../../services/maintenance/maintenanceService';
import { getAircraftList } from '../../../services/aircraft/aircraftService';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import { Select, Input, DatePicker, message } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

type MaintenanceStatus = 'Pending' | 'In Progress' | 'Completed';

interface Aircraft {
  aircraft_id: number;
  model: string;
}

const statusOptions: { value: MaintenanceStatus; label: string }[] = [
  { value: 'Pending', label: 'Pending' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' }
];

// Confirmation Modal Component
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  maintenanceData: {
    aircraft: string;
    date: string;
    location: string;
    status: string;
    assignedTo: string;
    details: string;
  };
  saving: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  maintenanceData,
  saving
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>Confirm Maintenance Log Creation</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <p>Please review the maintenance log details before creating:</p>
          
          <div className="confirm-details">
            <div className="confirm-detail-item">
              <span className="confirm-label">Aircraft:</span>
              <span className="confirm-value">{maintenanceData.aircraft}</span>
            </div>
            <div className="confirm-detail-item">
              <span className="confirm-label">Date:</span>
              <span className="confirm-value">{maintenanceData.date}</span>
            </div>
            <div className="confirm-detail-item">
              <span className="confirm-label">Location:</span>
              <span className="confirm-value">{maintenanceData.location}</span>
            </div>
            <div className="confirm-detail-item">
              <span className="confirm-label">Status:</span>
              <span className="confirm-value">{maintenanceData.status}</span>
            </div>
            {maintenanceData.assignedTo && (
              <div className="confirm-detail-item">
                <span className="confirm-label">Assigned To:</span>
                <span className="confirm-value">{maintenanceData.assignedTo}</span>
              </div>
            )}
            <div className="confirm-detail-item">
              <span className="confirm-label">Details:</span>
              <span className="confirm-value">{maintenanceData.details}</span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button 
            className="btn btn-confirm" 
            onClick={onConfirm}
            disabled={saving}
          >
            {saving ? 'Creating...' : 'Confirm & Create'}
          </button>
          <button 
            className="btn btn-cancel" 
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Result Modal Component
interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSuccess: boolean;
  message: string;
}

const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  onClose,
  isSuccess,
  message
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3>{isSuccess ? 'Success' : 'Error'}</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div className={isSuccess ? 'success-icon' : 'error-icon'}>
            {isSuccess ? '✓' : '✗'}
          </div>
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button 
            className="btn btn-confirm"
            onClick={onClose}
          >
            {isSuccess ? 'Go to Maintenance List' : 'Try Again'}
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateMaintenance: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);

  // Form state
  const [aircraftId, setAircraftId] = useState<number | null>(null);
  const [date, setDate] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [status, setStatus] = useState<MaintenanceStatus>('Pending');
  const [assignedTo, setAssignedTo] = useState<number | null>(null);
  const [details, setDetails] = useState<string>('');

  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(false);
  const [resultMessage, setResultMessage] = useState('');

  // Fetch aircrafts on component mount
  useEffect(() => {
    const fetchAircrafts = async () => {
      try {
        const data = await getAircraftList();
        if (Array.isArray(data)) {
          setAircrafts(data);
        } else {
          console.warn('Unexpected API response format:', data);
          setAircrafts([]);
        }
      } catch (err) {
        console.error('Error fetching aircrafts:', err);
        setAircrafts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAircrafts();
  }, []);

  const handleSave = () => {
    if (!aircraftId || !date || !location || !details) {
      message.error('Please fill in all required fields');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmedSave = async () => {
    try {
      setSaving(true);

      // Ensure required fields are not null
      if (!aircraftId) {
        throw new Error('Aircraft ID is required');
      }

      const data = {
        aircraft_id: aircraftId,
        date_of_maintenance: date,
        details,
        maintenance_location: location,
        status,
        ...(assignedTo && { assigned_to: assignedTo })
      };

      await createMaintenanceLog(data);
      
      setResultSuccess(true);
      setResultMessage('Maintenance log created successfully!');
      setShowResultModal(true);
      setShowConfirmModal(false);

      // Navigate after successful creation
      setTimeout(() => {
        navigate('/admin/maintenance');
      }, 2000);

    } catch (err) {
      console.error('Error creating maintenance:', err);
      setResultSuccess(false);
      setResultMessage(err instanceof Error ? err.message : 'Failed to create maintenance log');
      setShowResultModal(true);
      setShowConfirmModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleResultClose = () => {
    setShowResultModal(false);
    if (resultSuccess) {
      navigate('/admin/maintenance');
    }
  };

  const getSelectedAircraftInfo = () => {
    const aircraft = aircrafts.find(a => a.aircraft_id === aircraftId);
    return aircraft ? `${aircraft.aircraft_id} - ${aircraft.model}` : '';
  };

  if (loading || saving) {
    return <LoadingSpinner />;
  }

  return (
    <div className="create-maintenance-container">
      <div className="create-maintenance-header">
        <h1>Create Maintenance Log</h1>
        <div className="header-actions">
          <button 
            className="back-button"
            onClick={() => navigate('/admin/maintenance')}
          >
            <FaArrowLeft /> Back to List
          </button>
          <button 
            className="save-button"
            onClick={handleSave}
            disabled={saving}
          >
            <FaSave /> Create
          </button>
        </div>
      </div>

      <div className="create-maintenance-content">
        <div className="create-maintenance-grid">
          <div className="form-section">
            <h2><FaInfoCircle /> Basic Information</h2>
            <div className="form-item">
              <span className="form-label required">
                <FaPlane /> Aircraft
              </span>
              <Select
                className="aircraft-select"
                placeholder="Select Aircraft"
                value={aircraftId}
                onChange={(value) => setAircraftId(value)}
                style={{ width: '100%' }}
              >
                {aircrafts.map((aircraft) => (
                  <Option key={aircraft.aircraft_id} value={aircraft.aircraft_id}>
                    {`${aircraft.aircraft_id} - ${aircraft.model}`}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="form-item">
              <span className="form-label required">
                <FaClock /> Date
              </span>
              <DatePicker
                className="date-picker"
                onChange={(date) => setDate(date ? date.toISOString() : '')}
                format="DD/MM/YYYY"
              />
            </div>
            <div className="form-item">
              <span className="form-label required">
                <FaMapMarkerAlt /> Location
              </span>
              <Input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Enter maintenance location"
              />
            </div>
          </div>

          <div className="form-section">
            <h2><FaUser /> Assignment Information</h2>
            <div className="form-item">
              <span className="form-label">Status</span>
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
            <div className="form-item">
              <span className="form-label">Assigned To (ID)</span>
              <Input
                type="number"
                value={assignedTo || ''}
                onChange={e => setAssignedTo(e.target.value ? Number(e.target.value) : null)}
                placeholder="Enter crew member ID"
              />
            </div>
          </div>
        </div>

        <div className="maintenance-details-section">
          <h2>Maintenance Details</h2>
          <div className="form-item">
            <span className="form-label required">Details</span>
            <TextArea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Enter maintenance details"
              autoSize={{ minRows: 3, maxRows: 6 }}
            />
          </div>
        </div>

        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmedSave}
          maintenanceData={{
            aircraft: getSelectedAircraftInfo(),
            date: date ? dayjs(date).format('DD/MM/YYYY') : '',
            location,
            status,
            assignedTo: assignedTo ? assignedTo.toString() : '',
            details
          }}
          saving={saving}
        />

        {/* Result Modal */}
        <ResultModal
          isOpen={showResultModal}
          onClose={handleResultClose}
          isSuccess={resultSuccess}
          message={resultMessage}
        />
      </div>
    </div>
  );
};

export default CreateMaintenance; 