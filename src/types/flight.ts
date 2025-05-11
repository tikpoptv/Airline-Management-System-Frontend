// src/types/flight.ts

interface Location {
  latitude: number;
  longitude: number;
  city: string;
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
  