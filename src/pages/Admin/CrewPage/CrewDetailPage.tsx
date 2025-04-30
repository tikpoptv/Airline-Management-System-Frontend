import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Crew } from '../../../types/crew';
import { getCrewList } from '../../../services/crew/crewService';
import { getFlightsByCrewId } from '../../../services/flight/flightService';
import { Flight } from '../../../types/flight';
import CrewDetail from './CrewDetail';

function CrewDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [crew, setCrew] = useState<Crew | null>(null);
  const [flightList, setFlightList] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<'date' | 'status'>('date');
  const [flightFilter, setFlightFilter] = useState<'all' | 'today'>('all');
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const crewList = await getCrewList();
      const found = crewList.find((c: Crew) => c.crew_id.toString() === id);
      if (!found) {
        navigate('/admin/crew');
        return;
      }
      setCrew(found);

      const flights = await getFlightsByCrewId(found.crew_id);
      setFlightList(flights);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!crew) return <p>Crew not found</p>;

  return (
    <>
      <div className="page-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="edit-button" onClick={() => setIsEditMode((prev) => !prev)}>
          {isEditMode ? 'Done' : 'Edit'}
        </button>
      </div>

      <CrewDetail
        crew={crew}
        flightList={flightList}
        loading={false}
        sortOption={sortOption}
        setSortOption={setSortOption}
        flightFilter={flightFilter}
        setFlightFilter={setFlightFilter}
        onBack={() => navigate('/admin/crew')}
        isEditMode={isEditMode}
      />
    </>
  );
}

export default CrewDetailPage;