import { api } from '../api'; 
import { Airport } from '../types/airport';

export const getAirportList = async (): Promise<Airport[]> => {
  try {
    const response = await api.get('/api/airports');
    return response as Airport[];
  } catch (error) {
    console.error('Error fetching airport list:', error);
    throw error; 
  }
}; 

export const getAirportById = async (id: number): Promise<Airport | undefined> => {
  try {
    const airports = await getAirportList();
    return airports.find(airport => airport.airport_id === id);
  } catch (error) {
    console.error('Error fetching airport by id:', error);
    throw error;
  }
};

export interface UpdateAirportData {
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  status: 'active' | 'inactive';
}

export const updateAirport = async (id: number, data: UpdateAirportData): Promise<Airport> => {
  try {
    const response = await api.put(`/api/airports/${id}`, data);
    return response as Airport;
  } catch (error) {
    console.error('Error updating airport:', error);
    throw error;
  }
};

export const searchAirports = async (
  searchParams: {
    airportId?: string;
    name?: string;
    city?: string;
    country?: string;
  }
): Promise<Airport[]> => {
  try {
    const airports = await getAirportList();
    return airports.filter(airport => {
      const matchAirportId = !searchParams.airportId || 
        airport.airport_id.toString().includes(searchParams.airportId);
      
      const matchName = !searchParams.name || 
        airport.name.toLowerCase().includes(searchParams.name.toLowerCase()) ||
        airport.iata_code.toLowerCase().includes(searchParams.name.toLowerCase());
      
      const matchCity = !searchParams.city || 
        airport.city.toLowerCase().includes(searchParams.city.toLowerCase());
      
      const matchCountry = !searchParams.country || 
        airport.country.toLowerCase().includes(searchParams.country.toLowerCase());

      return matchAirportId && matchName && matchCity && matchCountry;
    });
  } catch (error) {
    console.error('Error searching airports:', error);
    throw error;
  }
}; 