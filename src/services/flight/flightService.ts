// src/services/flight/flightService.ts
import { api } from '../../api';
import { Flight, CrewMember, Passenger } from '../../pages/Admin/FlightPage/types';

interface Airport {
  iata_code: string;
  name: string;
  city: string;
  country: string;
}

export interface PassengerDetail extends Passenger {
  flight_details: {
    flight_number: string;
    departure_time: string;
    arrival_time: string;
    route: {
      from_airport: Airport;
      to_airport: Airport;
    };
  };
  special_requests?: string;
}

export interface UpdateFlightBasicData {
  flight_status?: string;
  cancellation_reason?: string;
}

export interface UpdateFlightAdvancedData {
  flight_number?: string;
  aircraft_id?: number;
  route_id?: number;
  departure_time?: string;
  arrival_time?: string;
}

export interface CreateFlightData {
  flight_number: string;
  aircraft_id: number;
  route_id: number;
  departure_time: string;
  arrival_time: string;
  flight_status: string;
}

export interface AssignCrewRequest {
  crew_id: number;
  role_in_flight: string;
}

export interface AvailableCrew {
  crew_id: number;
  name: string;
  role: string;
  flight_hours: number;
  status: string;
  license_valid: boolean;
}

export const getFlightsByAircraftId = async (aircraftId: number): Promise<Flight[]> => {
  return api.get(`/api/aircrafts/${aircraftId}/flights`);
};

export const getFlightsByCrewId = async (crewId: number): Promise<Flight[]> => {
  return api.get(`/api/crews/${crewId}/flights`);
};

export const getAllFlights = async () => {
  return api.get('/api/flights');
};

export const updateFlightBasic = async (flightId: number, data: UpdateFlightBasicData): Promise<Flight> => {
  return api.put(`/api/flights/${flightId}`, data);
};

export const updateFlightAdvanced = async (flightId: number, data: UpdateFlightAdvancedData): Promise<Flight> => {
  return api.put(`/api/flights/${flightId}/details`, data);
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
  getPassengerDetails: (passengerId: number): Promise<PassengerDetail> => {
    return api.get(`/api/passengers/${passengerId}`);
  },

  // Create a new flight
  createFlight: async (data: CreateFlightData): Promise<Flight> => {
    return api.post('/api/flights', data);
  },

  // Assign crew member to a flight
  assignCrewToFlight: async (flightId: number, data: AssignCrewRequest): Promise<void> => {
    return api.post(`/api/flights/${flightId}/assign-crew`, data);
  },

  // Get available crews for a flight
  getAvailableCrews: async (flightId: number): Promise<AvailableCrew[]> => {
    const response = await api.get(`/api/flights/${flightId}/available-crews`);
    return response.data;
  }
};