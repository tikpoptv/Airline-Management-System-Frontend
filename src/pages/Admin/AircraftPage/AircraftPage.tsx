import './AircraftPage.css';
import { useState, useEffect } from 'react';
import { Aircraft } from '../../../types/aircraft';
import { Flight } from '../../../types/flight';
import { getAircraftList } from '../../../services/aircraft/aircraftService';
import { getFlightsByAircraftId } from '../../../services/flight/flightService';
import AircraftList from './AircraftList';
import AircraftDetail from './AircraftDetail';

const AircraftPage = () => {
  const [aircraftList, setAircraftList] = useState<Aircraft[]>([]);
  const [flightList, setFlightList] = useState<Flight[]>([]);
  const [loadingAircrafts, setLoadingAircrafts] = useState(false);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);

  const [sortOption, setSortOption] = useState<'date' | 'status'>('date');
  const [flightFilter, setFlightFilter] = useState<'all' | 'today'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAircrafts = async () => {
      setLoadingAircrafts(true);
      try {
        const data = await getAircraftList();
        setAircraftList(data);
      } catch {
        setError('ไม่สามารถโหลดข้อมูลเครื่องบินได้');
      } finally {
        setLoadingAircrafts(false);
      }
    };
    fetchAircrafts();
  }, []);

  useEffect(() => {
    const fetchFlights = async () => {
      if (!selectedAircraft) return;
      setLoadingFlights(true);
      try {
        const data = await getFlightsByAircraftId(selectedAircraft.aircraft_id);
        setFlightList(data);
      } catch {
        setFlightList([]);
      } finally {
        setLoadingFlights(false);
      }
    };
    fetchFlights();
  }, [selectedAircraft]);

  return (
    <div className="aircraft-page">
      {error && <div className="error-message">{error}</div>}
      {!selectedAircraft ? (
        <AircraftList
          aircraftList={aircraftList}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          setSelectedAircraft={setSelectedAircraft}
          loading={loadingAircrafts}
        />
      ) : (
        <AircraftDetail
          aircraft={selectedAircraft}
          flightList={flightList}
          loading={loadingFlights}
          sortOption={sortOption}
          setSortOption={setSortOption}
          flightFilter={flightFilter}
          setFlightFilter={setFlightFilter}
          onBack={() => setSelectedAircraft(null)}
          isEditMode={isEditing}
        />
      )}
    </div>
  );
};

export default AircraftPage;
