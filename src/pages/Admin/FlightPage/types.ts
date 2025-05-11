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
  flight_status: 'Scheduled' | 'Completed' | 'Cancelled';
  cancellation_reason: string | null;
  aircraft: Aircraft;
  route: Route;
}

export interface CrewMember {
  crew_id: number;
  name: string;
  passport_number: string;
  role: string;
  role_in_flight: string;
  experience: number;  // years of experience
  status: string;
  email?: string;
  phone?: string;
}

export interface Passenger {
  passenger_id: number;
  name: string;
  passport_number: string;
  nationality: string;
  flight_id: number;
  special_requests?: string;
  user_id?: number;
} 