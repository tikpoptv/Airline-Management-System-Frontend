import { useState, useEffect } from 'react';
import { FilterStatus, FlightsResponse } from '../types/flight_dashboard';
import { getFlightsDashboard, getDashboardStats } from '../services/flightDashboardService';

interface DashboardData extends FlightsResponse {
  total_aircrafts: number;
  active_aircrafts: number;
  maintenance_aircrafts: number;
  total_crews: number;
  active_crews: number;
  total_routes: number;
  active_routes: number;
  total_airports: number;
}

export const useFlightDashboard = (initialStatus?: FilterStatus) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboardData = async (status?: FilterStatus) => {
    try {
      setLoading(true);
      const [flightsResponse, statsResponse] = await Promise.all([
        getFlightsDashboard(status),
        getDashboardStats()
      ]);

      setData({
        ...flightsResponse,
        ...statsResponse
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(initialStatus);
  }, [initialStatus]);

  return { data, loading, error, refetch: fetchDashboardData };
}; 