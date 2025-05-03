// FlightSchedule.tsx
import Loading from '../../../components/Loading';
import { Flight } from '../../../types/flight';

interface Props {
  flightList: Flight[];
  loading: boolean;
  sortOption: 'date' | 'status';
  setSortOption: (v: 'date' | 'status') => void;
  flightFilter: 'all' | 'today';
  setFlightFilter: (v: 'all' | 'today') => void;
}

const FlightSchedule = ({
  flightList,
  loading,
  sortOption,
  setSortOption,
  flightFilter,
  setFlightFilter,
}: Props) => {
  const getFilteredAndSortedFlights = (): Flight[] => {
    let filtered = [...flightList];

    if (flightFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter((f) => f.departure_time.startsWith(today));
    }

    const statusOrder: Record<string, number> = {
      Scheduled: 1,
      Boarding: 2,
      Delayed: 3,
      Completed: 4,
      Cancelled: 5,
    };

    filtered.sort((a, b) =>
      sortOption === 'date'
        ? new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime()
        : statusOrder[a.flight_status] - statusOrder[b.flight_status]
    );

    return filtered;
  };

  return (
    <div className="flight-schedule">
      <h2>Flight Schedule</h2>
      
      <div className="filter-sort-controls">
        <div>
          Filter: {' '}
          <select 
            value={flightFilter}
            onChange={(e) => setFlightFilter(e.target.value as 'all' | 'today')}
          >
            <option value="all">All Flights</option>
            <option value="today">Today</option>
          </select>
        </div>
        <div>
          Sort by: {' '}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as 'date' | 'status')}
          >
            <option value="date">Departure Time</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading flights..." />
      ) : getFilteredAndSortedFlights().length === 0 ? (
        <div className="empty-state">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="empty-state-icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
          </svg>
          <div className="empty-state-text">
            {flightFilter === 'today' ? 'No flights scheduled for today' : 'No flights found'}
          </div>
          <div className="empty-state-subtext">
            {flightFilter === 'today'
              ? 'Try checking other dates or updating the filter options'
              : 'Try adjusting your filter options to see more results'}
          </div>
        </div>
      ) : (
        <table className="flight-tasks">
          <thead>
            <tr>
              <th>STATUS</th>
              <th>FLIGHT NUMBER</th>
              <th>DATE</th>
              <th>FROM</th>
              <th>TO</th>
              <th>TIME</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredAndSortedFlights().map((flight) => (
              <tr key={flight.flight_id}>
                <td>
                  <span className={`status-badge ${flight.flight_status}`}>
                    {flight.flight_status}
                  </span>
                </td>
                <td>
                  <span className="flight-number">{flight.flight_number}</span>
                </td>
                <td>{new Date(flight.departure_time).toLocaleDateString('th-TH')}</td>
                <td>
                  <span className="airport-code">{flight.route.from_airport.iata_code}</span>
                </td>
                <td>
                  <span className="airport-code">{flight.route.to_airport.iata_code}</span>
                </td>
                <td className="time-column">
                  {new Date(flight.departure_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })} → {new Date(flight.arrival_time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FlightSchedule;
