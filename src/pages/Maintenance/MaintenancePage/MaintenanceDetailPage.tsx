import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { MaintenanceLog } from '../../../types/maintenance';
import { getMaintenanceLogDetail } from '../../../services/maintenance/maintenanceService';
import MaintenanceDetail from './MaintenanceDetail';
import styles from './MaintenanceDetail.module.css';
import { FaExclamationCircle } from 'react-icons/fa';

function MaintenanceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [maintenanceLog, setMaintenanceLog] = useState<MaintenanceLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Get current user ID from localStorage
  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        const userData = JSON.parse(userJson);
        if (userData && userData.user_id) {
          setCurrentUserId(userData.user_id);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      if (!id) {
        navigate('/maintenance/log');
        return;
      }
      const log = await getMaintenanceLogDetail(id);
      setMaintenanceLog(log);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEditClick = () => {
    // Check if current user is the assigned user
    if (maintenanceLog?.assigned_user?.user_id && currentUserId) {
      if (maintenanceLog.assigned_user.user_id === currentUserId) {
        setIsEditMode((prev) => !prev);
      } else {
        // Show permission denied modal
        setShowPermissionModal(true);
      }
    } else {
      // If there's no assigned user, also deny edit
      setShowPermissionModal(true);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!maintenanceLog) return <p>Maintenance log not found</p>;

  return (
    <>
      <div className={styles.pageActions} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: '1rem' }}>
        <button 
          className={styles.editButton} 
          onClick={handleEditClick}
        >
          {isEditMode ? 'Done' : 'Edit'}
        </button>
      </div>

      <MaintenanceDetail
        maintenanceLog={maintenanceLog}
        onBack={() => navigate('/maintenance/log')}
        isEditMode={isEditMode}
      />

      {/* Permission Denied Modal */}
      {showPermissionModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.permissionModal}>
            <div className={styles.modalIcon}>
              <FaExclamationCircle />
            </div>
            <h3>Permission Denied</h3>
            <p>You don't have permission to edit this maintenance log because you are not the assigned maintenance staff for this task.</p>
            <p>Only the assigned maintenance staff (ID: {maintenanceLog.assigned_user?.user_id}) can edit this record.</p>
            <button 
              className={styles.closeButton}
              onClick={() => setShowPermissionModal(false)}
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default MaintenanceDetailPage;