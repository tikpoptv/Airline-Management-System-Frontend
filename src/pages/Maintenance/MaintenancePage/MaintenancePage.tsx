import styles from './MaintenancePage.module.css';
import { useState, useEffect } from 'react';
import { MaintenanceLog } from '../../../types/maintenance';
import { getMaintenanceLogs, updateMaintenanceLog } from '../../../services/maintenance/maintenanceService';
import MaintenanceLogList from './MaintenanceList';
import MaintenanceDetail from './MaintenanceDetail';

const MaintenancePage = () => {
  const [maintenanceList, setMaintenanceList] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLogIds, setSelectedLogIds] = useState<number[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMaintenanceLog, setSelectedMaintenanceLog] = useState<MaintenanceLog | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

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
    setSelectedMaintenanceLog(log);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);

    try {
      for (const id of selectedLogIds) {
        await updateMaintenanceLog(id, { status: 'Cancelled' });
      }
      setSelectedLogIds([]);
      setShowConfirmModal(false);
      fetchMaintenanceLogs();

      setToastMessage('Cancelled successfully!');
      setToastType('success');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error(error);
      setToastMessage('Failed to cancel maintenance log.');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.maintenancePage}>
      {error && <div className={styles.errorMessage}>{error}</div>}

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
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <h3>Confirm Cancel Maintenance Logs</h3>
            <p>Are you sure you want to cancel {selectedLogIds.length} maintenance log(s)?</p>
            <div className={styles.modalActions}>
              <button
                className={styles.confirmButton}
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Cancelling...' : 'Confirm'}
              </button>
              <button
                className={styles.cancelButton}
                onClick={() => setShowConfirmModal(false)}
                disabled={isDeleting}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div
          className={`${styles.toast} ${toastType === 'success' ? styles.success : styles.error}`}
          style={{
            position: 'fixed',
            top: '2rem',
            right: '2rem',
            backgroundColor: toastType === 'success' ? '#4caf50' : '#f44336',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            zIndex: 9999,
            fontSize: '1rem',
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;