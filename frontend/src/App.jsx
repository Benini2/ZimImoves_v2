import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RotaPrivada from './components/RotaPrivada';

import Login from './pages/Login';

import PublicLayout from './pages/public/PublicLayout';
import Home from './pages/public/Home';
import Catalogo from './pages/public/Catalogo';
import Detalhe from './pages/public/Detalhe';
import Contato from './pages/public/Contato';

import DashboardLayout from './pages/dashboard/DashboardLayout';
import Imoveis from './pages/dashboard/Imoveis';
import ImovelForm from './pages/dashboard/ImovelForm';
import ImovelDetalhe from './pages/dashboard/ImovelDetalhe';
import Banners from './pages/dashboard/Banners';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Vitrine pública */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/imovel/:id" element={<Detalhe />} />
            <Route path="/contatos" element={<Contato />} />
          </Route>

          {/* Login do dashboard, acessado em /login */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard interno, protegido por login */}
          <Route
            path="/dashboard"
            element={
              <RotaPrivada>
                <DashboardLayout />
              </RotaPrivada>
            }
          >
            <Route index element={<Imoveis />} />
            <Route path="imoveis/novo" element={<ImovelForm />} />
            <Route path="imoveis/:id" element={<ImovelForm />} />
            <Route path="imoveis/:id/detalhes" element={<ImovelDetalhe />} />
            <Route path="banners" element={<Banners />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
