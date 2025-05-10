import { useEffect, useState } from 'react';
import { CrewScheduleItem } from '../../../types/crew';
import Loading from '../../../components/Loading';
import { getCrewSchedule } from '../../../services/crew/crewService';

interface Props {
  crewId: number;
}

const CrewSchedule = ({ crewId }: Props) => {
  const [schedules, setSchedules] = useState<CrewScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<'date' | 'role'>('date');
  const [flightFilter, setFlightFilter] = useState<'all' | 'today'>('all');

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const response = await getCrewSchedule(crewId);
        if (!response || !Array.isArray(response)) {
          throw new Error('Invalid response data');
        }
        setSchedules(response);
        setError(null);
      } catch (err) {
        setError('Unable to load flight schedule');
        console.error('Error fetching schedule:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [crewId]);

  const getFilteredAndSortedSchedules = (): CrewScheduleItem[] => {
    if (!schedules) return [];
    
    let filtered = [...schedules];

    try {
      if (flightFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        filtered = filtered.filter((s) => {
          try {
            return s.flight.departure_time.startsWith(today);
          } catch (e) {
            console.error('Error filtering flight:', e);
            return false;
          }
        });
      }

      filtered.sort((a, b) => {
        try {
          if (sortOption === 'date') {
            return new Date(a.flight.departure_time).getTime() - new Date(b.flight.departure_time).getTime();
          }
          return a.role_in_flight.localeCompare(b.role_in_flight);
        } catch (e) {
          console.error('Error sorting flights:', e);
          return 0;
        }
      });

      return filtered;
    } catch (e) {
      console.error('Error in getFilteredAndSortedSchedules:', e);
      return [];
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (e) {
      console.error('Error formatting time:', e);
      return dateString;
    }
  };

  if (error) {
    return (
      <div className="schedule-container">
        <div className="text-red-500 py-4 text-center">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h2 className="schedule-title">Flight Schedule</h2>
        <div className="filter-sort-bar">
          <div className="dropdown-group">
            <label htmlFor="filter">Show:</label>
            <select
              id="filter"
              value={flightFilter}
              onChange={(e) => setFlightFilter(e.target.value as 'all' | 'today')}
              className="filter-select"
            >
              <option value="all">All Flights</option>
              <option value="today">Today</option>
            </select>
          </div>

          <div className="dropdown-group">
            <label htmlFor="sort">Sort by:</label>
            <select
              id="sort"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as 'date' | 'role')}
              className="sort-select"
            >
              <option value="date">Date</option>
              <option value="role">Role</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <Loading message="Loading flight schedule..." />
      ) : (
        <div className="schedule-table-container">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Flight</th>
                <th>Date</th>
                <th>Route</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredAndSortedSchedules().length ? (
                getFilteredAndSortedSchedules().map((schedule) => (
                  <tr key={`${schedule.flight.flight_id}-${schedule.role_in_flight}`}>
                    <td>
                      <span className={`role-badge ${schedule.role_in_flight.toUpperCase()}`}>
                        {schedule.role_in_flight}
                      </span>
                    </td>
                    <td className="flight-number">{schedule.flight.flight_number}</td>
                    <td>{formatDate(schedule.flight.departure_time)}</td>
                    <td className="route-cell">
                      <div className="route-info">
                        <span>{schedule.flight.route.from_airport.iata_code}</span>
                        <span className="route-arrow">→</span>
                        <span>{schedule.flight.route.to_airport.iata_code}</span>
                      </div>
                    </td>
                    <td className="time-cell">
                      <div className="time-info">
                        <span>{formatTime(schedule.flight.departure_time)}</span>
                        <span className="time-separator">-</span>
                        <span>{formatTime(schedule.flight.arrival_time)}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty-message">
                    No flight schedule found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CrewSchedule;