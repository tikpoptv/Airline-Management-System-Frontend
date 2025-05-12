import { api } from '../api';
import { FilterStatus, FlightsResponse } from '../types/flight_dashboard';

interface DashboardStats {
  total_aircrafts: number;
  active_aircrafts: number;
  maintenance_aircrafts: number;
  total_crews: number;
  active_crews: number;
  total_routes: number;
  active_routes: number;
  total_airports: number;
}

export const getFlightsDashboard = async (status?: FilterStatus): Promise<FlightsResponse> => {
  return api.get(`/api/flights/today${status ? `?status=${status}` : ''}`);
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  return api.get('/api/dashboard/stats');
}; 