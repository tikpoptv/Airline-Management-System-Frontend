import { Crew } from '../../../types/crew';
import { Flight } from '../../../types/flight';
import CrewProfileSection from './CrewUserProfileSection';
import CrewSchedule from './CrewUserSchedule';
import { CrewProfile } from '../../../types/crewuser';

interface Props {
  crew: Crew;
  flightList: Flight[];
  loading: boolean;
  sortOption: 'date' | 'status';
  setSortOption: (v: 'date' | 'status') => void;
  flightFilter: 'all' | 'today';
  setFlightFilter: (v: 'all' | 'today') => void;
  onBack: () => void;
  isEditMode: boolean;
}

// Map Crew to CrewProfile for compatibility
function crewToCrewProfile(crew: Crew): CrewProfile {
  return {
    crew_id: crew.crew_id,
    name: crew.name,
    passport_number: crew.passport_number,
    role: crew.role,
    license_expiry_date: crew.license_expiry_date,
    passport_expiry_date: crew.passport_expiry_date,
    flight_hours: crew.flight_hours,
    status: crew.status,
    user: {
      user_id: crew.user.user_id,
      username: crew.user.username,
      email: crew.user.email,
      role: 'crew', // force to 'crew' as required by CrewProfile
      is_active: crew.user.is_active,
      created_at: crew.user.created_at,
    }
  };
}

const CrewDetail = ({
  crew,
  onBack,
  isEditMode,
}: Props) => {
  return (
    <div className="crew-detail">
      <div className="page-header-row">
        <div className="page-heading-left">
          <h1 className="page-title">{isEditMode ? 'Edit Crew Info' : 'Crew Management'}</h1>
          <div className="breadcrumb">
            <span className="breadcrumb-section">{isEditMode ? 'Crew' : 'View Detail'}</span>
            <span className="breadcrumb-arrow">›</span>
            <span className="breadcrumb-current">
              {isEditMode ? 'Edit Profile' : 'Profile'}
            </span>
          </div>
        </div>
        <button className="back-button" onClick={onBack}>← Back</button>
      </div>

      <h2 className="section-title">Crew Profile</h2>

      <CrewProfileSection
        crew={crewToCrewProfile(crew)}
      />

      <CrewSchedule />
    </div>
  );
};

export default CrewDetail;