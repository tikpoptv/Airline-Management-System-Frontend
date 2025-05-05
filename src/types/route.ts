export interface Airport {
  airport_id: number;
  iata_code: string;
  name: string;
  city: string;
  country: string;
}

export interface Route {
  route_id: number;
  from_airport: Airport;
  to_airport: Airport;
  distance: number;
  estimated_duration: string;
  status: 'active' | 'inactive';
} 