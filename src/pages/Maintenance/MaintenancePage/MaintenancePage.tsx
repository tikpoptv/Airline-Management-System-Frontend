import './MaintenancePage.css';
import { useState, useEffect } from 'react';
import { MaintenanceLog } from '../../../types/maintenance';
import { getMaintenanceLogs, cancelMaintenanceLog } from '../../../services/maintenance/maintenanceService';
import MaintenanceLogList from './MaintenanceList';
import { useNavigate } from 'react-router-dom';

const MaintenancePage = () => {
  const [maintenanceList, setMaintenanceList] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLogIds, setSelectedLogIds] = useState<number[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const navigate = useNavigate();

  

  const fetchMaintenanceLogs = async () => {
    setLoading(true);
    try {
      const data = await getMaintenanceLogs();
      console.log("Fetched maintenance logs:", data);
      setMaintenanceList(data);
    } catch {
      setError("ไม่สามารถโหลดข้อมูล maintenance logs ได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceLogs();
  }, []);

  const handleSelectMaintenanceLog = (log: MaintenanceLog) => {
    navigate(`/admin/maintenance/${log.log_id}`);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setDeleteStatus('idle');

    try {
      for (const id of selectedLogIds) {
        await cancelMaintenanceLog(id);
      }
      setDeleteStatus('success');
      setSelectedLogIds([]);
      setShowConfirmModal(false);
      fetchMaintenanceLogs();

      setToastMessage('Cancelled successfully!');
      setToastType('success');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error(error);
      setDeleteStatus('error');
      setToastMessage('Failed to cancel maintenance log.');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="maintenance-page">
      {error && <div className="error-message">{error}</div>}

      <MaintenanceLogList
        maintenanceList={maintenanceList}
        isEditing={isEditing}
        setIsEditing={(v) => {
          setIsEditing(v);
          if (!v) setSelectedLogIds([]);
        }}
        setSelectedMaintenanceLog={handleSelectMaintenanceLog}
        loading={loading}
        selectedLogIds={selectedLogIds}
        setSelectedLogIds={setSelectedLogIds}
        onDelete={() => setShowConfirmModal(true)}
      />

      {showConfirmModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Confirm To Cancel Maintenance Log</h3>
            <p>Cancelling Maintenance Log ID(s): {selectedLogIds.join(', ')}</p>

            {isDeleting && <p>Cancelling...</p>}
            {!isDeleting && deleteStatus === 'success' && <p style={{ color: 'green' }}>Cancelled successfully ✅</p>}
            {!isDeleting && deleteStatus === 'error' && <p style={{ color: 'red' }}>Cancel failed ❌</p>}

            <div className="modal-actions">
              <button
                className="confirm-button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                Confirm
              </button>
              <button
                className="cancel-button"
                onClick={() => {
                  if (!isDeleting) {
                    setShowConfirmModal(false);
                    setDeleteStatus('idle');
                  }
                }}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

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
            fontSize: '1rem',
            transition: 'opacity 0.3s ease',
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;