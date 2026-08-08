import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Envolve as páginas do dashboard: sem login válido, manda para /login
export default function RotaPrivada({ children }) {
  const { logado } = useAuth();
  if (!logado) return <Navigate to="/login" replace />;
  return children;
}
