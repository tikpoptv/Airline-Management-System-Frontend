// src/services/flight/flightService.ts
import { API_BASE_URL } from '../../config';
import { getToken } from '../auth/authService';
import { Flight } from '../../types/flight';

export const getFlightsByAircraftId = async (aircraftId: number): Promise<Flight[]> => {
  const token = getToken();
  if (!token) throw new Error("Unauthorized: No token provided");

  const response = await fetch(`${API_BASE_URL}/api/aircrafts/${aircraftId}/flights`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to fetch flight data");
  }

  return response.json();
};
