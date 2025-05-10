import { api } from '../api';
import { Airport, SearchAirportParams, CreateAirportRequest, UpdateAirportData } from '../types/airport';

export const getAirportList = async (): Promise<Airport[]> => {
  return api.get('/api/airports');
};

export const getAirportById = async (id: number): Promise<Airport | undefined> => {
  const airports = await getAirportList();
  return airports.find(airport => airport.airport_id === id);
};

export const searchAirports = async (params: SearchAirportParams): Promise<Airport[]> => {
  return api.get(`/api/airports/search?${new URLSearchParams(params as Record<string, string>)}`);
};

export const createAirport = async (data: CreateAirportRequest): Promise<Airport> => {
  return api.post('/api/airports', data);
};

export const updateAirport = async (id: number, data: UpdateAirportData): Promise<Airport> => {
  return api.put(`/api/airports/${id}`, data);
}; 