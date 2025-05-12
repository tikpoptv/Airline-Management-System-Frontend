import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Crew } from '../../../types/crew';
import CrewProfileSection from './CrewProfileSection';
import Loading from '../../../components/Loading';
import { getCrewById } from '../../../services/crew/crewService';

const CrewDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [crew, setCrew] = useState<Crew | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('Crew ID is required');
        setLoading(false);
        return;
      }

      const crewId = parseInt(id);
      if (isNaN(crewId)) {
        setError('Invalid Crew ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const crewData = await getCrewById(crewId);
        setCrew(crewData);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load crew data. Please try again later.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    try {
      setLoading(true);
      const crewData = await getCrewById(crewId);
      setCrew(crewData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load crew data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [id]);

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

function fetchData() {
    throw new Error('Function not implemented.');
}
