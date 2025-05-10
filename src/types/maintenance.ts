export type MaintenanceStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export interface MaintenanceUser {
  user_id: number;
  username: string;
}

export interface MaintenanceAircraft {
  aircraft_id: number;
  model: string;
}

export interface MaintenanceLog {
  log_id: number;
  aircraft_id: number;
  date_of_maintenance: string; // RFC3339 format
  details: string;
  maintenance_location: string;
  status: MaintenanceStatus;
  assigned_user: MaintenanceUser;
  aircraft: MaintenanceAircraft;
}

export interface MaintenanceSearchParams {
  status?: MaintenanceStatus;
  assigned_to?: number;
  aircraft_id?: number;
}

// Error response type
export interface MaintenanceError {
  error: string;
} 