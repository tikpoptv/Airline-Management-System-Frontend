export interface Airport {
  airport_id: number;
  iata_code: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  status: 'active' | 'inactive';
}

export interface SearchAirportParams {
  airportId?: string;
  name?: string;
  city?: string;
  country?: string;
}

export interface CreateAirportRequest {
  iata_code: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  status: 'active' | 'inactive';
}

export interface UpdateAirportData {
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  status: 'active' | 'inactive';
} 