import { api } from "../../api";
import { API_BASE_URL } from '../../config';
import { Crew, CrewScheduleResponse } from "../../types/crew";

export interface AvailableCrew {
  crew_id: number;
  first_name: string;
  last_name: string;
  position: string;
  license_number: string;
  passport_number: string;
  status: string;
}

interface UpdateCrewData {
  name?: string;
  role?: 'Pilot' | 'Co-Pilot' | 'Attendant' | 'Technician';
  flight_hours?: number;
  status?: 'active' | 'inactive' | 'on_leave' | 'training';
}

interface CreateCrewData {
  name: string;
  passport_number: string;
  role: 'Pilot' | 'Co-Pilot' | 'Attendant' | 'Technician';
  license_expiry_date: string;
  passport_expiry_date: string;
  flight_hours: number;
  user_id?: number;
  status: 'active' | 'inactive' | 'on_leave' | 'training';
}

interface CrewResponse {
  ID: number;
  name: string;
  passport_number: string;
  role: 'Pilot' | 'Co-Pilot' | 'Attendant' | 'Technician';
  license_expiry_date: string;
  passport_expiry_date: string;
  flight_hours: number;
  user_id: number;
  status: 'active' | 'inactive' | 'on_leave' | 'training';
}

const getToken = () => localStorage.getItem("token");

export const getCrewList = async (): Promise<Crew[]> => {
  const token = getToken();
  if (!token) throw new Error('Unauthorized: No token provided');

  const response = await fetch(`${API_BASE_URL}/api/crew`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch crew list');
  }

  return response.json();
};

export const getCrewById = async (id: number): Promise<Crew> => {
  return api.get(`/api/crew/${id}`);
};

export const getCrewSchedule = async (id: number): Promise<CrewScheduleResponse> => {
  return api.get(`/api/crew/${id}/schedule`);
};

export const deleteCrewById = async (id: number): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/crew/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'unknown error' }));
    throw new Error(error.error || `Failed to delete crew with ID ${id}`);
  }
};

export const updateCrew = async (id: number, data: UpdateCrewData): Promise<Crew> => {
  return api.put(`/api/crew/${id}`, data);
};

export const createCrew = async (data: CreateCrewData): Promise<CrewResponse> => {
  try {
    const response = await api.post('/api/crew', data);
    
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid response format from server');
    }

    const { ID, name, role, status } = response;
    if (!ID || !name || !role || !status) {
      throw new Error('Missing required fields in crew server response');
    }
    
    return response as CrewResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create crew member');
  }
};

export const crewService = {
  // Get available crews for a flight
  getAvailableCrews: async (flightId: number): Promise<AvailableCrew[]> => {
    try {
      return api.get(`/api/flights/${flightId}/available-crews`);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch available crews');
    }
  }
};