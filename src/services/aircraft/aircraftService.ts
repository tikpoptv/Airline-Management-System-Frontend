// src/services/aircraft/aircraftService.ts
import { api } from '../../api';
import { UpdateAircraftPayload } from '../../types/aircraft';
import { Aircraft } from '../../types/aircraft';

export const getAircraftList = async () => {
  return api.get('/api/aircrafts');
};

export const updateAircraftById = async (id: number, data: UpdateAircraftPayload) => {
  return api.put(`/api/aircrafts/${id}`, data);
};

export const getAircraftById = async (id: number): Promise<Aircraft> => {
  const response = await api.get(`/api/aircrafts/${id}`);
  return response.data;
};

export const deleteAircraftById = async (id: number) => {
  return api.delete(`/api/aircrafts/${id}`);
};

export const getAircraftModels = async () => {
  return api.get('/api/models/aircraft');
};

export const getAirlineModels = async () => {
  return api.get('/api/models/airline');
};

export const createAircraft = async (data: Omit<Aircraft, 'aircraft_id'>) => {
  return api.post('/api/aircrafts', data);
};
