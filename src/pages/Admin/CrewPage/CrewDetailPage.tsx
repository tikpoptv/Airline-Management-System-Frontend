import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Crew } from '../../../types/crew';
import { Flight } from '../../../types/flight';
import CrewProfileSection from './CrewProfileSection';
import Loading from '../../../components/Loading';
import { getCrewById } from '../../../services/crew/crewService';
import { getFlightsByCrewId } from '../../../services/flight/flightService';

const CrewDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [crew, setCrew] = useState<Crew | null>(null);
  const [flightList, setFlightList] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFlights, setLoadingFlights] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const crewData = await getCrewById(parseInt(id));
        setCrew(crewData);
      } catch (err) {
        setError('ไม่สามารถโหลดข้อมูลลูกเรือได้');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchFlights = async () => {
      if (!id) return;

      try {
        setLoadingFlights(true);
        const flights = await getFlightsByCrewId(parseInt(id));
        setFlightList(flights);
      } catch (err) {
        console.error('Error fetching flights:', err);
      } finally {
        setLoadingFlights(false);
      }
    };

    fetchFlights();
  }, [id]);

  if (loading) {
    return <Loading message="กำลังโหลดข้อมูลลูกเรือ..." />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!crew) {
    return <div className="error-message">ไม่พบข้อมูลลูกเรือ</div>;
  }

  return (
    <CrewProfileSection
      crew={crew}
      flightList={flightList}
      loadingFlights={loadingFlights}
    />
  );
};

export default CrewDetailPage;