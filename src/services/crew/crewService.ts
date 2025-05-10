import { api } from "../../api";
import { Crew } from "../../types/crew";

export const getCrewList = async (): Promise<Crew[]> => {
  return api.get('/api/crew');
};

export const getCrewById = async (id: number): Promise<Crew> => {
  return api.get(`/api/crew/${id}`);
};

export const deleteCrewById = async (id: number): Promise<void> => {
  return api.delete(`/api/crew/${id}`);
};

