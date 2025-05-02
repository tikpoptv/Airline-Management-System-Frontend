import './AircraftPage.css';
import { useState, useEffect } from 'react';
import { Aircraft } from '../../../types/aircraft';
import { getAircraftList, deleteAircraftById } from '../../../services/aircraft/aircraftService';
import AircraftList from './AircraftList';
import { useNavigate } from 'react-router-dom';

const AircraftPage = () => {
  const [aircraftList, setAircraftList] = useState<Aircraft[]>([]);
  const [loadingAircrafts, setLoadingAircrafts] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  // ✅ Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const navigate = useNavigate();

  const fetchAircrafts = async () => {
    setLoadingAircrafts(true);
    try {
      const data = await getAircraftList();
      setAircraftList(data);
    } catch {
      setError('ไม่สามารถโหลดข้อมูลเครื่องบินได้');
    } finally {
      setLoadingAircrafts(false);
    }
  };

  useEffect(() => {
    fetchAircrafts();
  }, []);

  const handleSelectAircraft = (aircraft: Aircraft) => {
    navigate(`/admin/aircrafts/${aircraft.aircraft_id}`);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setDeleteStatus('idle');

    try {
      for (const id of selectedIds) {
        await deleteAircraftById(id);
      }
      setDeleteStatus('success');
      setSelectedIds([]);
      setShowConfirmModal(false);
      fetchAircrafts();

      // ✅ แสดง Toast สำเร็จ
      setToastMessage('Deleted successfully!');
      setToastType('success');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

    } catch (error) {
      console.error(error);
      setDeleteStatus('error');
    
      setToastMessage('Failed to delete aircraft.');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
     finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="aircraft-page">
      {error && <div className="error-message">{error}</div>}

      <AircraftList
        aircraftList={aircraftList}
        isEditing={isEditing}
        setIsEditing={(v) => {
          setIsEditing(v);
          if (!v) setSelectedIds([]);
        }}
        setSelectedAircraft={handleSelectAircraft}
        loading={loadingAircrafts}
        selectedAircraftIds={selectedIds}
        setSelectedAircraftIds={setSelectedIds}
        onDelete={() => setShowConfirmModal(true)}
      />

      {showConfirmModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Confirm To Delete Aircraft</h3>
            <p>Deleting Aircraft ID(s): {selectedIds.join(', ')}</p>

            {isDeleting && <p>Deleting...</p>}
            {!isDeleting && deleteStatus === 'success' && <p style={{ color: 'green' }}>Deleted successfully ✅</p>}
            {!isDeleting && deleteStatus === 'error' && <p style={{ color: 'red' }}>Delete failed ❌</p>}

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
        <div className={`toast ${toastType} ${showToast ? 'show' : 'hide'}`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default AircraftPage;
