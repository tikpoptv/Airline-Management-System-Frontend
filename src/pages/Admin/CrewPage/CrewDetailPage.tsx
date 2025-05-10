import { useState, useEffect } from 'react';
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

  if (loading) {
    return <Loading message="กำลังโหลดข้อมูลลูกเรือ..." />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!crew) {
    return <div className="error-message">ไม่พบข้อมูลลูกเรือ</div>;
  }

  return <CrewProfileSection crew={crew} />;
};

export default CrewDetailPage;