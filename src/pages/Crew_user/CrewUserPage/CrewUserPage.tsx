import './CrewUserPage.css';
import { useState, useEffect } from 'react';
import { CrewProfile } from '../../../types/crewuser';
import { getCrewProfile } from '../../../services/crewuser/crewuserService';
import CrewList from './CrewUserList';
import { useNavigate } from 'react-router-dom';

const CrewPage = () => {
  const [crewList, setCrewList] = useState<CrewProfile[]>([]);
  const [loadingCrew, setLoadingCrew] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchCrew = async () => {
    setLoadingCrew(true);
    try {
      const data = await getCrewProfile();
      console.log("Fetched crew profile:", data);
      setCrewList([data]); // Since getCrewProfile returns a single profile
    } catch (error) {
      console.error("Error fetching crew:", error);
      setError("ไม่สามารถโหลดข้อมูลลูกเรือได้");
    } finally {
      setLoadingCrew(false);
    }
  };

  useEffect(() => {
    fetchCrew();
  }, []);

  const handleSelectCrew = (crew: CrewProfile) => {
    navigate(`/admin/crew/${crew.crew_id}`);
  };

  return (
    <div className="crew-page">
      {error && <div className="error-message">{error}</div>}

      <CrewList
        crewList={crewList}
        isEditing={false}
        setIsEditing={() => {}}
        setSelectedCrew={handleSelectCrew}
        loading={loadingCrew}
        selectedCrewIds={[]}
        setSelectedCrewIds={() => {}}
        onDelete={() => {}}
      />
    </div>
  );
};

export default CrewPage;