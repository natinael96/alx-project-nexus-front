import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import useAuthStore from '../stores/authStore';

interface EmployerRouteProps {
  children: ReactNode;
}

function EmployerRoute({ children }: EmployerRouteProps) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'employer' && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default EmployerRoute;
