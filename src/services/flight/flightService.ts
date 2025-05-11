// src/services/flight/flightService.ts
import { api } from '../../api';
import { Flight, CrewMember, Passenger } from '../../pages/Admin/FlightPage/types';

export const getFlightsByAircraftId = async (aircraftId: number): Promise<Flight[]> => {
  return api.get(`/api/aircrafts/${aircraftId}/flights`);
};

export const getFlightsByCrewId = async (crewId: number): Promise<Flight[]> => {
  return api.get(`/api/crews/${crewId}/flights`);
};

export const getAllFlights = async () => {
  return api.get('/api/flights');
};

export const flightService = {
  // Get flight details including route and aircraft info
  getFlightDetails: (flightId: number): Promise<Flight> => {
    return api.get(`/api/flights/${flightId}`);
  },

  // Get crew members assigned to a flight
  getFlightCrew: (flightId: number): Promise<CrewMember[]> => {
    return api.get(`/api/flights/${flightId}/crew`);
  },

  // Get passengers on a flight
  getFlightPassengers: (flightId: number): Promise<Passenger[]> => {
    return api.get(`/api/flights/${flightId}/passengers`);
  },

  // Get detailed information about a specific passenger
  getPassengerDetails: (passengerId: number): Promise<any> => {
    return api.get(`/api/passengers/${passengerId}`);
  }
};