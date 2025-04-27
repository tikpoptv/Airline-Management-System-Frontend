// src/types/crew.ts

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
    user: CrewUser;
  }
  
  export interface CreateCrewPayload {
    name: string;
    passport_number: string;
    role: 'Pilot' | 'Co-Pilot' | 'Attendant' | 'Technician';
    license_expiry_date: string;
    passport_expiry_date: string;
    flight_hours?: number;
    user_id?: number | null;
  }
  
  export interface UpdateCrewPayload {
    name?: string;
    passport_number?: string;
    role?: 'Pilot' | 'Co-Pilot' | 'Attendant' | 'Technician';
    license_expiry_date?: string;
    passport_expiry_date?: string;
    flight_hours?: number;
    user_id?: number | null;
  }
  