import { api } from '../../api';
import { Route } from '../../types/route';

export const getRouteList = async (): Promise<Route[]> => {
  return api.get('/api/routes');
}; 