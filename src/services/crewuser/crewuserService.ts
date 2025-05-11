import { api } from "../../api";
import { CrewAssignment, UpdateCrewProfilePayload, CrewProfile } from "../../types/crewuser";

// Get crew profile
export const getCrewProfile = async (): Promise<CrewProfile> => {
  return api.get('/api/crew/me');
};

// Get crew assignments
export const getCrewAssignments = async (): Promise<CrewAssignment[]> => {
  return api.get('/api/crew/me/assignments');
};

// Update crew profile
export const updateCrewProfile = async (profileData: UpdateCrewProfilePayload): Promise<string> => {
  const response = await api.put('/api/crew/me/update-profile', profileData);
  return response.message;
};
