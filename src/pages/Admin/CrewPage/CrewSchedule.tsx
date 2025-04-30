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

const CrewSchedule = ({
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
    <>
      <h4 style={{ fontSize: 25 }}>Crew Flight Schedule</h4>

      {loading ? (
        <Loading message="Loading crew flight schedule..." />
      ) : (
        <>
          <div className="filter-sort-bar">
            <div className="dropdown-group">
              <label htmlFor="filter">Filter:</label>
              <select
                id="filter"
                value={flightFilter}
                onChange={(e) => setFlightFilter(e.target.value as 'all' | 'today')}
              >
                <option value="all">All Flights</option>
                <option value="today">Today Only</option>
              </select>
            </div>

            <div className="dropdown-group">
              <label htmlFor="sort">Sort by:</label>
              <select
                id="sort"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as 'date' | 'status')}
              >
                <option value="date">Departure Time</option>
                <option value="status">Flight Status</option>
              </select>
            </div>
          </div>

          <table className="schedule-table">
            <thead>
              <tr className="task-row">
                <td colSpan={6}>
                  <h3><strong>Flight Assignments</strong></h3>
                </td>
              </tr>
              <tr>
                <th>Status</th>
                <th>Flight Number</th>
                <th>Date</th>
                <th>From</th>
                <th>To</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredAndSortedFlights().length ? (
                getFilteredAndSortedFlights().map((f) => (
                  <tr key={f.flight_id}>
                    <td className={`flight-status ${f.flight_status}`}>{f.flight_status}</td>
                    <td>{f.flight_number}</td>
                    <td>{new Date(f.departure_time).toLocaleDateString('th-TH')}</td>
                    <td>{f.route.from_airport.iata_code}</td>
                    <td>{f.route.to_airport.iata_code}</td>
                    <td>
                      {new Date(f.departure_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })} → {new Date(f.arrival_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>
                    No flight assignments
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </>
  );
};

export default CrewSchedule;