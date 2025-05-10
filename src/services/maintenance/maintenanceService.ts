import { API_BASE_URL } from "../../config";
import { MaintenanceLog, CreateMaintenanceLogPayload, UpdateMaintenanceLogPayload,} from "../../types/maintenance";

const getToken = () => localStorage.getItem("token");

/**
 * Get all maintenance logs with optional filtering
 */
export const getMaintenanceLogs = async (
): Promise<MaintenanceLog[]> => {
  const token = getToken();
  if (!token) throw new Error('Unauthorized: No token provided');

  const response = await fetch(`${API_BASE_URL}/api/maintenance-logs`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch maintenance logs');
  }
  
  return response.json();
};

/**
 * Get a specific maintenance log by ID
 */
export const getMaintenanceLogById = async (id: number): Promise<MaintenanceLog> => {
  const token = getToken();
  if (!token) throw new Error('Unauthorized: No token provided');

  const response = await fetch(`${API_BASE_URL}/api/maintenance-logs/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Failed to fetch maintenance log with ID ${id}`);
  }
  
  return response.json();
};

/**
 * Create a new maintenance log
 */
export const createMaintenanceLog = async (
  logData: CreateMaintenanceLogPayload
): Promise<MaintenanceLog> => {
  const token = getToken();
  if (!token) throw new Error('Unauthorized: No token provided');

  const response = await fetch(`${API_BASE_URL}/api/maintenance-logs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(logData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to create maintenance log' }));
    throw new Error(errorData.error || 'Failed to create maintenance log');
  }
  
  return response.json();
};

/**
 * Update an existing maintenance log
 */
export const updateMaintenanceLog = async (
  id: number, 
  logData: UpdateMaintenanceLogPayload
): Promise<MaintenanceLog> => {
  const token = getToken();
  if (!token) throw new Error('Unauthorized: No token provided');

  const response = await fetch(`${API_BASE_URL}/api/maintenance-logs/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(logData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to update maintenance log' }));
    throw new Error(errorData.message || `Failed to update maintenance log with ID ${id}`);
  }
  
  return response.json();
};

/**
 * Delete (cancel) a maintenance log by ID
 * Note: According to your API, we don't actually delete logs, we mark them as "Cancelled"
 */
export const cancelMaintenanceLog = async (id: number): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error('Unauthorized: No token provided');

  const response = await fetch(`${API_BASE_URL}/api/maintenance-logs/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'Cancelled'
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'unknown error' }));
    throw new Error(errorData.error || `Failed to cancel maintenance log with ID ${id}`);
  }
};

/**
 * Batch update multiple maintenance logs (e.g., to cancel multiple logs)
 */
export const batchUpdateMaintenanceLogs = async (
  ids: number[],
  updateData: UpdateMaintenanceLogPayload
): Promise<void> => {
  const token = getToken();
  if (!token) throw new Error('Unauthorized: No token provided');

  // This endpoint is assumed based on common patterns, adjust if needed
  const response = await fetch(`${API_BASE_URL}/api/maintenance-logs/batch`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ids,
      ...updateData
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to update maintenance logs' }));
    throw new Error(errorData.error || 'Failed to update maintenance logs in batch');
  }
};