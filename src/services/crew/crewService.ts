import { API_BASE_URL } from "../../config";
import { Crew } from "../../types/crew";

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

export const updateCrewById = async (id: number, crewData: Partial<Crew>): Promise<Crew> => {
  const token = getToken();
  if (!token) throw new Error('Unauthorized: No token provided');

  const response = await fetch(`${API_BASE_URL}/api/crew/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(crewData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to update crew' }));
    throw new Error(errorData.message || `Failed to update crew with ID ${id}`);
  }

  return response.json();
};

