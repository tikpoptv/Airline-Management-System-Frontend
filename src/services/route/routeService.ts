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