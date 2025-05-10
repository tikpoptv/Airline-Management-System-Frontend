import { useState, useEffect } from 'react';
import { MaintenanceLog } from '../../../types/maintenance';
import MaintenanceProfileSection from './MaintenanceProfileSection';
import './MaintenanceDetail.css'

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
    <div className="maintenance-detail">
      <div className="page-header-row">
        <div className="page-heading-left">
          <h1 className="page-title">{isEditMode ? 'Edit Maintenance Log' : 'Maintenance Management'}</h1>
          <div className="breadcrumb">
            <span className="breadcrumb-section">Maintenance</span>
            <span className="breadcrumb-arrow">›</span>
            <span className="breadcrumb-current">
              {isEditMode ? 'Edit Log' : 'Log Details'}
            </span>
          </div>
        </div>
        <button className="back-button" onClick={onBack}>← Back</button>
      </div>

      <h2 className="section-title">Maintenance Log Details</h2>

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