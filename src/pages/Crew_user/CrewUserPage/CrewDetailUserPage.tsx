import { useState, useEffect, useCallback } from 'react';
import { CrewProfile } from '../../../types/crewuser';
// import { Flight } from '../../../types/flight';
import CrewProfileSection from './CrewUserProfileSection';
import Loading from '../../../components/Loading';
import { getCrewProfile } from '../../../services/crewuser/crewuserService';

const CrewDetailPage = () => {
  const [crew, setCrew] = useState<CrewProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [isEditMode, setIsEditMode] = useState(false);
  // const [sortOption, setSortOption] = useState<'date' | 'status'>('date');
  // const [flightFilter, setFlightFilter] = useState<'all' | 'today'>('all');
  // const [flightList, setFlightList] = useState<Flight[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const crewData = await getCrewProfile();
      setCrew(crewData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load crew data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);



  if (loading) {
    return <Loading message="Loading crew data..." />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!crew) {
    return <div className="error-message">Crew not found</div>;
  }

  return <CrewProfileSection crew={crew} />;
};

export default CrewDetailPage;