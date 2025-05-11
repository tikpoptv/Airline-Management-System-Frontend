import { api } from "../../api";
import { Crew, CrewScheduleResponse } from "../../types/crew";
import { CrewAssignment } from "../../types/crewuser";

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

export const getCrewList = async (): Promise<Crew[]> => {
  return api.get('/api/crew');
};

export const getCrewAssignments = async (): Promise<CrewAssignment[]> => {
  return api.get('/api/crew/assignments');
};

export const getCrewById = async (id: number): Promise<Crew> => {
  return api.get(`/api/crew/${id}`);
};

export const getCrewSchedule = async (id: number): Promise<CrewScheduleResponse> => {
  return api.get(`/api/crew/${id}/schedule`);
};

export const deleteCrewById = async (id: number): Promise<void> => {
  return api.delete(`/api/crew/${id}`);
};

export const updateCrew = async (id: number, data: UpdateCrewData): Promise<Crew> => {
  const response = await api.put(`/api/crew/${id}`, data);
  return response;
};

export const createCrew = async (data: CreateCrewData): Promise<CrewResponse> => {
  try {
    console.log('[DEBUG] Sending create crew request with data:', data);
    
    const response = await api.post('/api/crew', data);
    console.log('[DEBUG] Raw crew API response:', response);
    
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid response format from server');
    }

    // ตรวจสอบว่า response มี properties ที่จำเป็นครบถ้วน
    const { ID, name, role, status } = response;
    if (!ID || !name || !role || !status) {
      console.error('[DEBUG] Invalid crew response structure:', response);
      throw new Error('Missing required fields in crew server response');
    }

    console.log('[DEBUG] Parsed crew response:', response);
    
    return response as CrewResponse;
  } catch (error) {
    console.error('[DEBUG] Error in createCrew:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create crew member');
  }
};