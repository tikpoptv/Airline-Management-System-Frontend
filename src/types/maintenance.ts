// src/types/maintenance.ts

// Status types for maintenance logs
export type MaintenanceLogStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

// User related interfaces for maintenance logs
export interface MaintenanceUser {
  user_id: number;
  username: string;
}

// Aircraft reference used in maintenance logs
export interface MaintenanceAircraft {
  aircraft_id: number;
  model: string;
}

// Maintenance log interface
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

