import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Envolve páginas que só alguns papéis podem acessar (ex: Usuários, Cadastrar imóvel).
// Se não estiver logado, manda pro login; se estiver logado mas sem o papel certo, manda pro início do painel.
export default function RotaComPapel({ papeis, children }) {
  const { logado, usuario } = useAuth();
  if (!logado) return <Navigate to="/login" replace />;
  if (!papeis.includes(usuario?.role)) return <Navigate to="/dashboard" replace />;
  return children;
}
