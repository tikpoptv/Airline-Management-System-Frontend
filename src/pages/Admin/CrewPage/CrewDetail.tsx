import { useState, useEffect } from 'react';
import { Crew } from '../../../types/crew';
import { Flight } from '../../../types/flight';
import CrewProfileSection from './CrewProfileSection';
import FlightSchedule from './CrewFlightSchedule';
import './CrewDetail.css'

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


const CrewDetail = ({
  crew,
  flightList,
  loading,
  sortOption,
  setSortOption,
  flightFilter,
  setFlightFilter,
  onBack,
  isEditMode,
}: Props) => {
  const [editData, setEditData] = useState<Crew>(crew);
  const [originalData, setOriginalData] = useState<Crew>(crew);
  

  useEffect(() => {
    setEditData(crew);
    setOriginalData(crew);
  }, [crew]);
  console.log('Flight List:', flightList);
  const handleChange = <K extends keyof Crew>(field: K, value: Crew[K]) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  return (
    <div className="crew-detail">
      <div className="page-header-row">
        <div className="page-heading-left">
          <h1 className="page-title">{isEditMode ? 'Edit Crew Info' : 'Crew Management'}</h1>
          <div className="breadcrumb">
            <span className="breadcrumb-section">Crew</span>
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
        editData={editData}
        originalData={originalData}
        isEditMode={isEditMode}
        handleChange={handleChange}
      />

      <FlightSchedule
        flightList={flightList}
        loading={loading}
        sortOption={sortOption}
        setSortOption={setSortOption}
        flightFilter={flightFilter}
        setFlightFilter={setFlightFilter}
      />
    </div>
    
  );
};

export default CrewDetail;