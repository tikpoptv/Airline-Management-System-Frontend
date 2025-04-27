import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Aircraft } from '../../../types/aircraft';
import { getAircraftList } from '../../../services/aircraft/aircraftService';
import AircraftDetail from './AircraftDetail';
import { getFlightsByAircraftId } from '../../../services/flight/flightService';
import { Flight } from '../../../types/flight';

function AircraftDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [aircraft, setAircraft] = useState<Aircraft | null>(null);
  const [flightList, setFlightList] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<'date' | 'status'>('date');
  const [flightFilter, setFlightFilter] = useState<'all' | 'today'>('all');
  const [isEditMode, setIsEditMode] = useState(false); // ✅ เพิ่มควบคุมโหมด Edit

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const aircrafts = await getAircraftList();
      const found = aircrafts.find((a: Aircraft) => a.aircraft_id.toString() === id);
      if (!found) {
        navigate('/admin/aircrafts');
        return;
      }
      setAircraft(found);

      const flights = await getFlightsByAircraftId(found.aircraft_id);
      setFlightList(flights);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!aircraft) return <p>Aircraft not found</p>;

  return (
    <>
      {/* ปุ่ม Edit/Done */}
      <div className="page-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button className="edit-button" onClick={() => setIsEditMode((prev) => !prev)}>
          {isEditMode ? 'Done' : 'Edit'}
        </button>
      </div>

      <AircraftDetail
        aircraft={aircraft}
        flightList={flightList}
        loading={false}
        sortOption={sortOption}
        setSortOption={setSortOption}
        flightFilter={flightFilter}
        setFlightFilter={setFlightFilter}
        onBack={() => navigate('/admin/aircrafts')}
        isEditMode={isEditMode}
      />
    </>
  );
}

export default AircraftDetailPage;
