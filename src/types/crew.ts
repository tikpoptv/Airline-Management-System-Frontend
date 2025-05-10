// src/types/crew.ts
import { Airport } from './airport';

export interface CrewUser {
    user_id: number;
    username: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
  }
  
  export interface Crew {
    crew_id: number;
    name: string;
    passport_number: string;
    role: 'Pilot' | 'Co-Pilot' | 'Attendant' | 'Technician';
    license_expiry_date: string;
    passport_expiry_date: string;
    flight_hours: number;
    status: 'active' | 'inactive' | 'on_leave' | 'training';
    user: CrewUser;
  }
  
  export interface CreateCrewPayload {
    name: string;
    passport_number: string;
    role: 'Pilot' | 'Co-Pilot' | 'Attendant' | 'Technician';
    license_expiry_date: string;
    passport_expiry_date: string;
    flight_hours?: number;
    status?: 'active' | 'inactive' | 'on_leave' | 'training';
    user_id?: number | null;
  }
  
  export interface UpdateCrewPayload {
    name?: string;
    passport_number?: string;
    role?: 'Pilot' | 'Co-Pilot' | 'Attendant' | 'Technician';
    license_expiry_date?: string;
    passport_expiry_date?: string;
    flight_hours?: number;
    status?: 'active' | 'inactive' | 'on_leave' | 'training';
    user_id?: number | null;
  }
  
  export interface Aircraft {
    aircraft_id: number;
    registration: string;
    model: string;
    manufacturer: string;
  }
  
  export interface Route {
    from_airport: Airport;
    to_airport: Airport;
  }
  
  export interface Flight {
    flight_id: number;
    flight_number: string;
    departure_time: string;
    arrival_time: string;
    aircraft: Aircraft;
    route: Route;
  }
  
  export interface CrewScheduleItem {
    role_in_flight: string;
    flight: Flight;
  }
  
  export interface CrewScheduleResponse {
    data: CrewScheduleItem[];
    status: string;
    message: string;
  }
  