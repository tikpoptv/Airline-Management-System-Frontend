import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MaintenanceLog } from '../../../types/maintenance';
import { getMaintenanceLogById } from '../../../services/maintenance/maintenanceService';
import MaintenanceDetail from './MaintenanceDetail';
import styles from './MaintenanceDetail.module.css';

function MaintenanceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [maintenanceLog, setMaintenanceLog] = useState<MaintenanceLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      if (!id) {
        navigate('/maintenance/maintenance');
        return;
      }
      const log = await getMaintenanceLogById(parseInt(id));
      setMaintenanceLog(log);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!maintenanceLog) return <p>Maintenance log not found</p>;

  return (
    <>
      <div className={styles.pageActions} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: '1rem' }}>
        <button className={styles.editButton} onClick={() => setIsEditMode((prev) => !prev)}>
          {isEditMode ? 'Done' : 'Edit'}
        </button>
      </div>

      <MaintenanceDetail
        maintenanceLog={maintenanceLog}
        onBack={() => navigate('/admin/maintenance')}
        isEditMode={isEditMode}
      />
    </>
  );
}

export default MaintenanceDetailPage;