import { useState } from 'react';
import { Crew } from '../../../types/crew';
import { Flight } from '../../../types/flight';
import CrewSchedule from './CrewSchedule';
import { FaUser, FaPassport, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './CrewPage.css';

interface Props {
  crew: Crew;
  flightList: Flight[];
  loadingFlights: boolean;
}

const CrewProfileSection = ({ crew, flightList, loadingFlights }: Props) => {
  const [sortOption, setSortOption] = useState<'date' | 'status'>('date');
  const [flightFilter, setFlightFilter] = useState<'all' | 'today'>('all');
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
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
    switch (status) {
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

  return (
    <div className="crew-details-page">
      <div className="details-header">
        <div className="breadcrumb">
          <span>Crew</span>
          <span className="separator">/</span>
          <span>View Detail</span>
        </div>
        <h1>Crew Details</h1>
        <button className="back-button" onClick={() => navigate('/admin/crew')}>
          <FaArrowLeft /> Back
        </button>
      </div>

      <div className="crew-profile-grid">
        <div className="profile-image-section">
          <img 
            src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
            alt="Crew Member" 
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
                <span>{crew.name.split(' ')[0]}</span>
              </div>
              <div className="info-item">
                <label>Last Name</label>
                <span>{crew.name.split(' ').slice(1).join(' ')}</span>
              </div>
              <div className="info-item">
                <label>Role</label>
                <span className={`role-badge ${crew.role.toLowerCase()}`}>
                  {crew.role}
                </span>
              </div>
              <div className="info-item">
                <label>Flight Hours</label>
                <span>{crew.flight_hours.toFixed(1)} hours</span>
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
                <span>{new Date(crew.passport_expiry_date).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <label>License Expiry</label>
                <span>{new Date(crew.license_expiry_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

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

          <div className="schedule-section">
            <CrewSchedule
              flightList={flightList}
              loading={loadingFlights}
              sortOption={sortOption}
              setSortOption={setSortOption}
              flightFilter={flightFilter}
              setFlightFilter={setFlightFilter}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrewProfileSection;