// src/types/flight.ts

interface Location {
  latitude: number;
  longitude: number;
  city: string;
}

export interface MapFlight {
  id: string;
  flightNumber: string;
  departure: Location;
  arrival: Location;
  currentLocation: Location;
  status: string;
  progress: number;
}

export interface Flight {
  id: string;
  flightNumber: string;
  departure: Location;
  arrival: Location;
  currentLocation: Location;
  status: string;
  progress: number;
}

export type FlightStatus = 'Scheduled' | 'Boarding' | 'Delayed' | 'Cancelled';
export type FilterStatus = 'all' | 'active' | 'delayed' | 'cancelled';

export interface Airport {
  airport_id: number;
  iata_code: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface Route {
  route_id: number;
  from_airport: Airport;
  to_airport: Airport;
  distance: number;
  estimated_duration: string;
  status: string;
}

export interface Aircraft {
  aircraft_id: number;
  model: string;
  manufacture_year: number;
  capacity: number;
  airline_owner: string;
  maintenance_status: string;
  aircraft_history: string;
}

export interface Flight {
  flight_id: number;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  flight_status: FlightStatus;
  cancellation_reason: string | null;
  aircraft: Aircraft;
  route: Route;
}

export interface FlightsResponse {
  total_flights: number;
  flights: Flight[];
  // Additional dashboard stats
  total_aircrafts: number;
  active_aircrafts: number;
  maintenance_aircrafts: number;
  total_crews: number;
  active_crews: number;
  total_routes: number;
  active_routes: number;
  total_airports: number;
}

// สำหรับแสดงผลบน Dashboard
export interface FlightStats {
  totalFlights: number;
  activeFlights: number;
  delayedFlights: number;
  cancelledFlights: number;
}

export interface Notification {
  id: number;
  type: 'delay' | 'maintenance' | 'weather';
  message: string;
  time: string;
}
  