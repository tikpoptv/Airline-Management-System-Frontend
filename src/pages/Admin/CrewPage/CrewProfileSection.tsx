// import { useState } from 'react';
// import { FaTrash } from 'react-icons/fa';
// import { Crew } from '../../../types/crew';
// import avatarImg from '../../../assets/images/resize.webp';
// import { updateCrewById, deleteCrewById } from '../../../services/crew/crewService';
// import { useNavigate } from 'react-router-dom';

// interface Props {
//   editData: Crew;
//   originalData: Crew;
//   isEditMode: boolean;
//   handleChange: <K extends keyof Crew>(field: K, value: Crew[K]) => void;
// }

// const CrewProfileSection = ({
//   editData,
//   originalData,
//   isEditMode,
//   handleChange,
// }: Props) => {
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [saving, setSaving] = useState(false);

//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);

//   const [toastMessage, setToastMessage] = useState<string | null>(null);
//   const [showToast, setShowToast] = useState(false);
//   const [toastType, setToastType] = useState<'success' | 'error'>('success');

//   const navigate = useNavigate();

//   const triggerToast = (message: string, type: 'success' | 'error') => {
//     setToastMessage(message);
//     setToastType(type);
//     setShowToast(true);
//     setTimeout(() => setShowToast(false), 3000);
//   };

//   const confirmSave = async () => {
//     setSaving(true);
//     try {
//       const response = await updateCrewById(editData.crew_id, {
//         rank: editData.rank,
//         status: editData.status,
//         flight_hours: editData.flight_hours,
//         bio: editData.bio,
//       });

//       if (response && response.success !== false) {
//         triggerToast("✅ Crew updated successfully!", 'success');
//         setShowConfirmModal(false);
//       } else {
//         triggerToast("❌ Update failed: Unexpected server response.", 'error');
//       }
//     } catch (error: any) {
//       triggerToast("❌ Update failed: " + error.message, 'error');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const confirmDelete = async () => {
//     setIsDeleting(true);
//     try {
//       await deleteCrewById(editData.crew_id);
//       triggerToast("✅ Crew deleted successfully!", 'success');
//       navigate('/admin/crew');
//     } catch (error: any) {
//       triggerToast("❌ Delete failed: " + error.message, 'error');
//     } finally {
//       setIsDeleting(false);
//       setShowDeleteConfirm(false);
//     }
//   };

//   return (
//     <div className="profile-wrapper">
//       <div className="form-grid">
//         <div className="avatar-cell">
//           <div className="profile-avatar">
//             <img src={avatarImg} alt="avatar" />
//           </div>
//         </div>

//         <div className="aircraft-id-group">
//           <label>Crew ID</label>
//           <div className="input-with-icon">
//             <div className="read-only-field">{editData.crew_id}</div>
//             {isEditMode && (
//               <button className="delete-button" onClick={() => setShowDeleteConfirm(true)}>
//                 <FaTrash />
//               </button>
//             )}
//           </div>
//         </div>

//         <div className="input-group">
//           <label>Full Name</label>
//           <div className="read-only-field">{editData.name}</div>
//         </div>

//         <div className="input-group">
//           <label>Rank</label>
//           <div className="read-only-field">{editData.rank}</div>
//         </div>

//         <div className="input-group">
//           <label>Status</label>
//           {isEditMode ? (
//             <select
//               value={editData.status}
//               onChange={(e) => handleChange('status', e.target.value as Crew['status'])}
//             >
//               <option value="Available">Available</option>
//               <option value="On Duty">On Duty</option>
//               <option value="Inactive">Inactive</option>
//             </select>
//           ) : (
//             <div className="read-only-field">{editData.status}</div>
//           )}
//         </div>

//         <div className="input-group">
//           <label>Flight Hours</label>
//           {isEditMode ? (
//             <input
//               type="number"
//               value={editData.flight_hours}
//               onChange={(e) => handleChange('flight_hours', Number(e.target.value))}
//             />
//           ) : (
//             <div className="read-only-field">{editData.flight_hours}</div>
//           )}
//         </div>

//         <div className="input-group aircraft-history">
//           <label>Bio</label>
//           {isEditMode ? (
//             <textarea
//               value={editData.bio}
//               onChange={(e) => handleChange('bio', e.target.value)}
//             />
//           ) : (
//             <div className="read-only-field">{editData.bio}</div>
//           )}
//         </div>

//         {isEditMode && (
//           <div className="save-button-cell">
//             <button className="save-button" onClick={() => setShowConfirmModal(true)}>
//               Save Changes
//             </button>
//           </div>
//         )}

//         {showConfirmModal && (
//           <div className="modal-backdrop">
//             <div className="modal-content">
//               <h3>Confirm Edit Crew</h3>
//               <div className="modal-diff">
//                 {editData.status !== originalData.status && (
//                   <p><strong>Status:</strong> {originalData.status} → {editData.status}</p>
//                 )}
//                 {editData.flight_hours !== originalData.flight_hours && (
//                   <p><strong>Flight Hours:</strong> {originalData.flight_hours} → {editData.flight_hours}</p>
//                 )}
//                 {editData.bio !== originalData.bio && (
//                   <p><strong>Bio:</strong> {originalData.bio || '—'} → {editData.bio || '—'}</p>
//                 )}
//               </div>
//               <div className="modal-actions">
//                 <button className="confirm-button" onClick={confirmSave} disabled={saving}>
//                   {saving ? 'Saving...' : 'Confirm'}
//                 </button>
//                 <button className="cancel-button" onClick={() => setShowConfirmModal(false)} disabled={saving}>
//                   Back
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {showDeleteConfirm && (
//           <div className="modal-backdrop">
//             <div className="modal-content">
//               <h3>Confirm Delete Crew</h3>
//               <p>Are you sure you want to delete Crew ID: {editData.crew_id}?</p>
//               <div className="modal-actions">
//                 <button className="confirm-button" onClick={confirmDelete} disabled={isDeleting}>
//                   {isDeleting ? 'Deleting...' : 'Confirm'}
//                 </button>
//                 <button className="cancel-button" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
//                   Back
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {showToast && (
//         <div
//           className={`toast ${toastType}`}
//           style={{
//             position: 'fixed',
//             top: '2rem',
//             right: '2rem',
//             backgroundColor: toastType === 'success' ? '#4caf50' : '#f44336',
//             color: 'white',
//             padding: '12px 24px',
//             borderRadius: '8px',
//             zIndex: 9999,
//             fontSize: '1rem',
//           }}
//         >
//           {toastMessage}
//         </div>
//       )}
//     </div>
//   );
// };

// export default CrewProfileSection;