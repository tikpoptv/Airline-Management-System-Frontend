// src/services/aircraft/aircraftService.ts
import { API_BASE_URL } from '../../config';
import { getToken } from '../auth/authService';
import { UpdateAircraftPayload } from '../../types/aircraft';
import { Aircraft } from '../../types/aircraft';

export const getAircraftList = async () => {
  const token = getToken();
  if (!token) throw new Error("Unauthorized: No token provided");

  const response = await fetch(`${API_BASE_URL}/api/aircrafts`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch aircraft list');
  }

  return response.json();
};


export const updateAircraftById = async (
  id: number,
  data: UpdateAircraftPayload
) => {
  const token = getToken();
  if (!token) throw new Error("Unauthorized: No token provided");

  const response = await fetch(`${API_BASE_URL}/api/aircrafts/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to update aircraft');
  }

  return response.json();
};

export const getAircraftById = async (id: number): Promise<Aircraft> => {
  const token = getToken();
  if (!token) throw new Error("Unauthorized: No token provided");

  const response = await fetch(`${API_BASE_URL}/api/aircrafts/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch aircraft details');
  }

  return response.json();
};

export const deleteAircraftById = async (id: number): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error("Unauthorized");

  const response = await fetch(`${API_BASE_URL}/api/aircrafts/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete aircraft");
  }
};
