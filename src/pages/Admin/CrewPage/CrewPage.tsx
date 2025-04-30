import './CrewPage.css';
import { useState, useEffect } from 'react';
import { Crew } from '../../../types/crew';
import { getCrewList, deleteCrewById } from '../../../services/crew/crewService';
import CrewList from './CrewList';
import { useNavigate } from 'react-router-dom';

const CrewPage = () => {
  const [crewList, setCrewList] = useState<Crew[]>([]);
  const [loadingCrew, setLoadingCrew] = useState(false);
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

  

  const fetchCrew = async () => {
    setLoadingCrew(true);
    try {
      const data = await getCrewList();
      console.log("Fetched crew list:", data); // Add this
      setCrewList(data);
    } catch {
      setError("ไม่สามารถโหลดข้อมูลลูกเรือได้");
    } finally {
      setLoadingCrew(false);
    }
  };

  useEffect(() => {
    fetchCrew();
  }, []);

  const handleSelectCrew = (crew: Crew) => {
    navigate(`/admin/crew/${crew.crew_id}`);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setDeleteStatus('idle');

    try {
      for (const id of selectedIds) {
        // 🛑 You must implement deleteCrewById
        await deleteCrewById(id);
      }
      setDeleteStatus('success');
      setSelectedIds([]);
      setShowConfirmModal(false);
      fetchCrew();

      setToastMessage('Deleted successfully!');
      setToastType('success');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error(error);
      setDeleteStatus('error');
      setToastMessage('Failed to delete crew.');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="crew-page">
      {error && <div className="error-message">{error}</div>}

      <CrewList
        crewList={crewList}
        isEditing={isEditing}
        setIsEditing={(v) => {
          setIsEditing(v);
          if (!v) setSelectedIds([]);
        }}
        setSelectedCrew={handleSelectCrew}
        loading={loadingCrew}
        selectedCrewIds={selectedIds}
        setSelectedCrewIds={setSelectedIds}
        onDelete={() => setShowConfirmModal(true)}
      />

      {showConfirmModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Confirm To Delete Crew</h3>
            <p>Deleting Crew ID(s): {selectedIds.join(', ')}</p>

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

export default CrewPage;