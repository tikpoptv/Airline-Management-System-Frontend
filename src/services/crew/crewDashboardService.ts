import { api } from '../../api';

interface CrewSchedule {
  crew_id: number;
  name: string;
  role: string;
  role_in_flight: string;
  flight_code: string;
  from_airport: string;
  to_airport: string;
  departure_time: string;
  arrival_time: string;
  status: string;
}

interface CrewScheduleResponse {
  total_schedules: number;
  schedules: CrewSchedule[];
}

export const getTodayCrewSchedules = async (limit: number = 5): Promise<CrewScheduleResponse> => {
  return api.get(`/api/dashboard/crew-schedule/today${limit ? `?limit=${limit}` : ''}`);
}; 