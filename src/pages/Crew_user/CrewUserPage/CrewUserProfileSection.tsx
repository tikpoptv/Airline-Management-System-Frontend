import { CrewProfile } from '../../../types/crewuser';
import CrewSchedule from './CrewUserSchedule';
import { FaUser, FaPassport, FaEnvelope, FaArrowLeft, FaPen } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './CrewUserPage.css';

interface Props {
  crew: CrewProfile;
}

const CrewProfileSection = ({ crew }: Props) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'on_leave':
        return 'status-on-leave';
      case 'training':
        return 'status-training';
      default:
        return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'on_leave':
        return 'On Leave';
      case 'training':
        return 'Training';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getNameParts = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || ''
    };
  };

  const { firstName, lastName } = getNameParts(crew.name);

  return (
    <div className="crew-details-page">
      <div className="details-header">
        <div className="breadcrumb">
          <span>Crew</span>
          <span className="separator">/</span>
          <span>View Detail</span>
        </div>
        <h1>Crew Details</h1>
        <div className="header-actions">
          <button className="edit-button" onClick={() => navigate(`/crew/crew/edit/${crew.crew_id}`)}>
            <FaPen /> Edit
          </button>
          <button className="back-button" onClick={() => navigate('/crew/crew')}>
            <FaArrowLeft /> Back
          </button>
        </div>
      </div>

      <div className="crew-profile-grid">
        <div className="profile-image-section">
          <img 
            src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
            alt={`${crew.name}'s profile`}
            className="crew-image" 
          />
          <div className="crew-basic-info">
            <div className="info-row">
              <span className="label">CREW ID</span>
              <span className="value">{crew.crew_id}</span>
            </div>
            <div className="info-row">
              <span className="label">NAME</span>
              <span className="value">{crew.name}</span>
            </div>
            <div className="info-row">
              <span className="label">STATUS</span>
              <span className={`status-badge ${getStatusColor(crew.status)}`}>
                {getStatusText(crew.status)}
              </span>
            </div>
          </div>
        </div>

        <div className="crew-details-sections">
          <div className="info-section">
            <div className="section-header">
              <FaUser className="section-icon" />
              <h2>Personal Information</h2>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <label>First Name</label>
                <span>{firstName}</span>
              </div>
              <div className="info-item">
                <label>Last Name</label>
                <span>{lastName}</span>
              </div>
              <div className="info-item">
                <label>Role</label>
                <span className={`role-badge ${crew.role.toLowerCase()}`}>
                  {crew.role}
                </span>
              </div>
              <div className="info-item">
                <label>Flight Hours</label>
                <span>{crew.flight_hours.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} hours</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <div className="section-header">
              <FaPassport className="section-icon" />
              <h2>Document Information</h2>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <label>Passport Number</label>
                <span>{crew.passport_number}</span>
              </div>
              <div className="info-item">
                <label>Passport Expiry</label>
                <span>{formatDate(crew.passport_expiry_date)}</span>
              </div>
              <div className="info-item">
                <label>License Expiry</label>
                <span>{formatDate(crew.license_expiry_date)}</span>
              </div>
            </div>
          </div>

          {crew.user && (
            <div className="info-section">
              <div className="section-header">
                <FaEnvelope className="section-icon" />
                <h2>Contact Information</h2>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <label>User ID</label>
                  <span>{crew.user.user_id}</span>
                </div>
                <div className="info-item">
                  <label>Username</label>
                  <span>{crew.user.username}</span>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <span>{crew.user.email}</span>
                </div>
              </div>
            </div>
          )}

          <div className="schedule-section">
            <CrewSchedule crewId={crew.crew_id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrewProfileSection;