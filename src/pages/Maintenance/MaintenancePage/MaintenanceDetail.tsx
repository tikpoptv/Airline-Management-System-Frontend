import { useState, useEffect } from 'react';
import { MaintenanceLog } from '../../../types/maintenance';
import MaintenanceProfileSection from './MaintenanceProfileSection';
import styles from './MaintenanceDetail.module.css';

interface Props {
  maintenanceLog: MaintenanceLog;
  onBack: () => void;
  isEditMode: boolean;
}

const MaintenanceDetail = ({
  maintenanceLog,
  onBack,
  isEditMode,
}: Props) => {
  const [editData, setEditData] = useState<MaintenanceLog>(maintenanceLog);
  const [originalData, setOriginalData] = useState<MaintenanceLog>(maintenanceLog);

  useEffect(() => {
    setEditData(maintenanceLog);
    setOriginalData(maintenanceLog);
  }, [maintenanceLog]);

  const handleChange = <K extends keyof MaintenanceLog>(field: K, value: MaintenanceLog[K]) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className={styles.maintenanceDetail}>
      <div className={styles.pageHeaderRow}>
        <div className={styles.pageHeadingLeft}>
          <h1 className={styles.pageTitle}>{isEditMode ? 'Edit Maintenance Log' : 'Maintenance Management'}</h1>
          <div className={styles.breadcrumb}>
            <span className={styles.breadcrumbSection}>Maintenance</span>
            <span className={styles.breadcrumbArrow}>›</span>
            <span className={styles.breadcrumbCurrent}>
              {isEditMode ? 'Edit Log' : 'Log Details'}
            </span>
          </div>
        </div>
        <button className={styles.backButton} onClick={onBack}>← Back</button>
      </div>

      <h2 className={styles.sectionTitle}>Maintenance Log Details</h2>

      <MaintenanceProfileSection
        editData={editData}
        originalData={originalData}
        isEditMode={isEditMode}
        handleChange={handleChange}
      />
    </div>
  );
};

export default MaintenanceDetail;