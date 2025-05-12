export interface Flight {
  flight_id: number;
  flight_number: string;
  departure_time: string; // ISO 8601 datetime
  arrival_time: string;
  flight_status: 'Scheduled' | 'Completed' | 'Cancelled';
  cancellation_reason: string | null;
  aircraft: {
    aircraft_id: number;
    model: string;
    maintenance_status: string;
  };
  route: {
    route_id: number;
    from_airport: {
      iata_code: string;
      name: string;
      city: string;
    };
    to_airport: {
      iata_code: string;
      name: string;
      city: string;
    };
  };
}