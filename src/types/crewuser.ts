// src/types/crewuser.ts

import { Aircraft } from './crew'; // Or wherever Aircraft is defined
import { Airport } from './airport'; // Already defined elsewhere

export interface CrewUser {
  crew_id: number;
  name: string;
  role: 'Pilot' | 'Co-Pilot' | 'Attendant' | 'Technician';
  user_id: number;
}

export interface CrewProfile {
  crew_id: number;
  name: string;
  passport_number: string;
  role: 'Pilot' | 'Co-Pilot' | 'Attendant' | 'Technician';
  license_expiry_date: string;
  passport_expiry_date: string;
  flight_hours: number;
  status: 'active' | 'inactive' | 'on_leave' | 'training';
  user: {
    user_id: number;
    username: string;
    email: string;
    role: 'crew';
    is_active: boolean;
    created_at: string;
  };
}

export interface FlightRoute {
  route_id: number;
  from_airport: Airport;
  to_airport: Airport;
}

export interface FlightAssignment {
  flight_id: number;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  flight_status: 'Scheduled' | 'Boarding' | 'Departed' | 'Delayed' | 'Cancelled' | string;
  aircraft: Aircraft;
  route: FlightRoute;
}

export interface CrewAssignment {
  role_in_flight: string;
  flight: FlightAssignment;
  crew: CrewUser;
}

// For the update profile request payload
export interface UpdateCrewProfilePayload {
  name: string;
  passport_number: string;
  role: 'Pilot' | 'Co-Pilot' | 'Attendant' | 'Technician';
  license_expiry_date: string;
  passport_expiry_date: string;
}