// src/services/aircraft/aircraftService.ts
import { API_BASE_URL } from '../../config';
import { getToken } from '../auth/authService';

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
