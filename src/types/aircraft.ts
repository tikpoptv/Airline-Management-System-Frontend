export interface Aircraft {
    aircraft_id: number;
    model: string;
    manufacture_year: number;
    capacity: number;
    airline_owner: string;
    maintenance_status: 'Operational' | 'In Maintenance' | 'Retired';
    aircraft_history: string;
  }
  
  export interface UpdateAircraftPayload {
    model: string;
    maintenance_status: string;
    capacity: number;
    aircraft_history: string;
  }
  
  export interface AircraftModel {
    model_id: number;
    model_name: string;
    manufacturer: string;
    capacity_range: string;
    description: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface AirlineModel {
    id: number;
    name: string;
    country: string;
    alliance: string;
    description: string;
    created_at: string;
    updated_at: string;
  }
  