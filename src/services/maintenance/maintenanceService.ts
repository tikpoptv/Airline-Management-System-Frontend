import { api } from '../../api';
import { MaintenanceLog, MaintenanceSearchParams } from '../../types/maintenance';

/**
 * Fetches maintenance logs with optional filters
 * @param params Optional search parameters
 * @returns Promise with array of maintenance logs
 */
export const getMaintenanceLogs = async (params?: MaintenanceSearchParams): Promise<MaintenanceLog[]> => {
  try {
    // Convert params to URLSearchParams if they exist
    const queryParams = params
      ? `?${new URLSearchParams(
          Object.entries(params)
            .filter(([, value]) => value !== undefined)
            .reduce((acc, [key, value]) => ({
              ...acc,
              [key]: value.toString()
            }), {})
        ).toString()}`
      : '';

    const response = await api.get(`/api/maintenance-logs${queryParams}`);
    
    // Check if response has data property
    if (response && Array.isArray(response)) {
      return response;
    }
    
    if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    console.warn('Unexpected API response format:', response);
    // If no valid data found, return empty array
    return [];
    
  } catch (error) {
    console.error('Error fetching maintenance logs:', error);
    throw error; // Re-throw to handle in component
  }
};

export const getMaintenanceLogDetail = async (id: string | number): Promise<MaintenanceLog> => {
  try {
    const response = await api.get(`/api/maintenance-logs/${id}`);
    
    // Check if response is direct data
    if (response && !response.data) {
      return response;
    }
    
    // Check if response has data property
    if (response && response.data) {
      return response.data;
    }
    
    throw new Error('Maintenance log not found');
  } catch (error) {
    console.error(`Error fetching maintenance log ${id}:`, error);
    throw error; // Re-throw to handle in component
  }
}; 