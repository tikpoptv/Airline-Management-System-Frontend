import { api } from "../../api";
import { Crew, CrewScheduleResponse } from "../../types/crew";

export const getCrewList = async (): Promise<Crew[]> => {
  return api.get('/api/crew');
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