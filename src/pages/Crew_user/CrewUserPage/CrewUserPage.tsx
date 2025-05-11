import './CrewUserPage.css';
import { useState, useEffect } from 'react';
import { CrewProfile } from '../../../types/crewuser';
import { getCrewProfile } from '../../../services/crewuser/crewuserService';
import CrewList from './CrewUserList';


const CrewPage = () => {
  const [crewList, setCrewList] = useState<CrewProfile[]>([]);
  const [loadingCrew, setLoadingCrew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);



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

  return (
    <div className="crew-page">
      {error && <div className="error-message">{error}</div>}

      <CrewList
        crewList={crewList}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        loading={loadingCrew}
        selectedCrewIds={[]}
        setSelectedCrewIds={() => {}}
        onDelete={() => {}}
      />
    </div>
  );
};

export default CrewPage;