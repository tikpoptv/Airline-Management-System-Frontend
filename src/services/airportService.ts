import { api } from '../api'; 
import { Airport } from '../types/airport';

export const getAirportList = async (): Promise<Airport[]> => {
  try {
    const response = await api.get('/api/airports');
    return response as Airport[];
  } catch (error) {
    console.error('Error fetching airport list in airportService:', error);
    throw error; 
  }
}; 