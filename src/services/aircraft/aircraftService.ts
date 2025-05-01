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
