import { useState, useEffect, useMemo } from 'react';
import { 
  getPassengers, 
  groupPassengersByNationality, 
  groupPassengersBySpecialRequests,
  PassengersResponse 
} from '../services/passengerService';

interface PassengerStats {
  totalPassengers: number;
  byNationality: { name: string; value: number }[];
  bySpecialRequests: { name: string; value: number }[];
  dailyData: { date: string; passengers: number }[];
}

export const usePassengerDashboard = () => {
  const [passengerData, setPassengerData] = useState<PassengersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Statistics calculated from passenger data
  const stats = useMemo<PassengerStats>(() => {
    if (!passengerData) {
      return {
        totalPassengers: 0,
        byNationality: [],
        bySpecialRequests: [],
        dailyData: []
      };
    }

    // Group data by nationality and special requests
    const byNationality = groupPassengersByNationality(passengerData.passengers);
    const bySpecialRequests = groupPassengersBySpecialRequests(passengerData.passengers);
    
    // Create sample data for daily display (in a real system, this should be from API)
    const today = new Date();
    const dailyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      // Random number of passengers between 10-30 per day
      const passengers = Math.floor(Math.random() * 20) + 10;
      return { date: dateStr, passengers };
    }).reverse();

    return {
      totalPassengers: passengerData.total,
      byNationality,
      bySpecialRequests,
      dailyData
    };
  }, [passengerData]);

  const fetchPassengers = async (page: number = 1, pageSize: number = 20) => {
    try {
      setLoading(true);
      const data = await getPassengers(page, pageSize);
      setPassengerData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassengers();
  }, []);

  return { 
    passengers: passengerData?.passengers || [], 
    stats, 
    pagination: passengerData ? {
      page: passengerData.page,
      pageSize: passengerData.page_size,
      totalPages: passengerData.total_pages,
      total: passengerData.total
    } : null,
    loading, 
    error, 
    refetch: fetchPassengers 
  };
}; 