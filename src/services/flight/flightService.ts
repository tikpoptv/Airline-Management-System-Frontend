// src/services/flight/flightService.ts
import { api } from '../../api';
import { Flight } from '../../types/flight';

export const getFlightsByAircraftId = async (aircraftId: number): Promise<Flight[]> => {
  return api.get(`/api/aircrafts/${aircraftId}/flights`);
};

export const getFlightsByCrewId = async (crewId: number): Promise<Flight[]> => {
  return api.get(`/api/crews/${crewId}/flights`);
};

export const getAllFlights = async () => {
  return api.get('/api/flights');
};