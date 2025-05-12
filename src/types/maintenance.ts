export type MaintenanceLogStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export interface MaintenanceSearchParams {
  aircraft_id?: number;
  status?: MaintenanceLogStatus;
  date_from?: string;
  date_to?: string;
  assigned_to?: number;
}

export interface MaintenanceUser {
  user_id: number;
  username: string;
}

export interface MaintenanceAircraft {
  aircraft_id: number;
  model: string;
  capacity: number;
  manufacture_year: number;
}

export interface MaintenanceLog {
  log_id: number;
  aircraft_id: number;
  date_of_maintenance: string; // RFC3339 format
  details: string;
  maintenance_location: string;
  status: MaintenanceLogStatus;
  assigned_user?: MaintenanceUser; // Optional user reference
  aircraft?: MaintenanceAircraft; // Optional aircraft reference
}

// Request payload for creating a maintenance log
export interface CreateMaintenanceLogPayload {
  aircraft_id: number;
  date_of_maintenance: string; // RFC3339 format e.g. "2025-08-01T09:00:00Z"
  details: string;
  maintenance_location: string;
  status?: MaintenanceLogStatus; // optional
  assigned_to?: number; // optional user_id
}

// Request payload for updating a maintenance log
export interface UpdateMaintenanceLogPayload {
  aircraft_id?: number;
  date_of_maintenance?: string; // RFC3339 format
  details?: string;
  maintenance_location?: string;
  status?: MaintenanceLogStatus;
  assigned_to?: number; // user_id
}

