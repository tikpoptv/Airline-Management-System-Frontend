import { api } from '../../api';
import { Route } from '../../types/route';

export const getRouteList = async (): Promise<Route[]> => {
  const response = await api.get('/api/routes');
  return response;
};

export const getRouteById = async (id: number): Promise<Route | undefined> => {
  const routes = await getRouteList();
  return routes.find(route => route.route_id === id);
};

export interface RouteCreateData {
  distance: number;
  estimated_duration: string;
  status: string;
  from_airport_id: number;
  to_airport_id: number;
}

export const addRoute = async (routeData: RouteCreateData): Promise<Route> => {
  return await api.post('/api/routes', routeData);
};

export interface RouteUpdateStatusData {
  status: 'active' | 'inactive';
}

export const updateRouteStatus = async (id: number, statusData: RouteUpdateStatusData): Promise<Route> => {
  return await api.put(`/api/routes/${id}/status`, statusData);
}; 