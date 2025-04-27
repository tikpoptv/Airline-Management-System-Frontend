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
  