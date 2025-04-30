import { API_BASE_URL } from "../../config";
import { Crew } from "../../types/crew";

const getToken = () => localStorage.getItem("token");

export const getCrewList = async (): Promise<Crew[]> => {
  const res = await fetch(`${API_BASE_URL}/crew`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "unknown error" }));
    throw new Error(error.error || "Failed to fetch crew list");
  }

  return res.json();
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