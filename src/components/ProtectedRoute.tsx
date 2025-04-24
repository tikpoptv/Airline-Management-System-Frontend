import { Navigate } from 'react-router-dom';
import { getToken, getUser, logout } from '../services/authService';

const ProtectedRoute = ({ children, allowedRole }: { children: JSX.Element, allowedRole: string }) => {
  const token = getToken();
  const user = getUser();

  if (!token || !user) return <Navigate to="/" replace />;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp < Date.now() / 1000) {
      logout();
      return <Navigate to="/" replace />;
    }
  } catch {
    logout();
    return <Navigate to="/" replace />;
  }

  if (user.role !== allowedRole) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
