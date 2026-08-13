import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, Images, Users, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROLE_LABEL = { master: 'master', corretor: 'corretor', visualizador: 'visualizador' };

function ItemMenu({ to, icone: Icone, label, fim, aoClicar }) {
  return (
    <NavLink
      to={to}
      end={fim}
      onClick={aoClicar}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 12px',
        borderRadius: 8,
        fontSize: 14,
        color: isActive ? 'var(--sidebar-texto-ativo)' : 'var(--sidebar-texto)',
        background: isActive ? 'var(--cor-primaria)' : 'transparent',
      })}
    >
      <Icone size={17} strokeWidth={1.8} />
      {label}
    </NavLink>
  );
}

export default function DashboardLayout() {
  const { usuario, sair, ehMaster } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);

  // Fecha o menu automaticamente ao trocar de página (celular/tablet)
  useEffect(() => { setMenuAberto(false); }, [location.pathname]);

  function aoSair() {
    sair();
    navigate('/login');
  }

  const iniciais = (usuario?.nome || usuario?.email || '?').slice(0, 2).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--fundo)' }}>
      {/* Barra do topo, só aparece em telas pequenas — fica FORA do flex row de baixo, por isso ocupa a largura toda */}
      <div className="topo-mobile">
        <button onClick={() => setMenuAberto(true)} style={{ background: 'transparent', border: 'none', color: '#fff', display: 'flex' }}>
          <Menu size={22} />
        </button>
        <p style={{ fontWeight: 600, fontSize: 15, margin: 0, color: '#fff' }}>
          Imobiliária<span style={{ color: 'var(--cor-primaria)' }}>.</span>
        </p>
        <div style={{ width: 22 }} />
      </div>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Fundo escurecido atrás do menu, quando ele está aberto no celular */}
        {menuAberto && <div className="sidebar-overlay" onClick={() => setMenuAberto(false)} />}

      <aside
        className={`sidebar-aside${menuAberto ? ' sidebar-aberta' : ''}`}
        style={{ width: 240, flexShrink: 0, background: 'var(--sidebar-fundo)' }}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            padding: '1.5rem 1rem',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ marginBottom: 28, paddingLeft: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: 17, margin: 0, color: 'var(--cor-primaria)' }}>
                Zim<span style={{ color: '#fff' }}> Imóveis.</span>
              </p>
              <p style={{ fontSize: 12, color: 'var(--sidebar-texto)', margin: '2px 0 0' }}>Painel administrativo</p>
            </div>
            <button
              onClick={() => setMenuAberto(false)}
              className="somente-mobile"
              style={{ background: 'transparent', border: 'none', color: 'var(--sidebar-texto)', padding: 0 }}
            >
              <X size={20} />
            </button>
          </div>

          <p style={{ fontSize: 11, letterSpacing: '0.06em', color: '#5b6580', fontWeight: 600, margin: '0 0 8px 12px' }}>
            PRINCIPAL
          </p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 20 }}>
            <ItemMenu to="/dashboard" fim icone={LayoutGrid} label="Imóveis" />
          </nav>

          <p style={{ fontSize: 11, letterSpacing: '0.06em', color: '#5b6580', fontWeight: 600, margin: '0 0 8px 12px' }}>
            VITRINE
          </p>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <ItemMenu to="/dashboard/banners" icone={Images} label="Banners" />
          </nav>

          {ehMaster && (
            <>
              <p style={{ fontSize: 11, letterSpacing: '0.06em', color: '#5b6580', fontWeight: 600, margin: '20px 0 8px 12px' }}>
                ADMINISTRAÇÃO
              </p>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <ItemMenu to="/dashboard/usuarios" icone={Users} label="Usuários" />
              </nav>
            </>
          )}

          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--sidebar-borda)', paddingTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34, height: 34, borderRadius: '50%', background: 'var(--cor-primaria)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                fontSize: 12, fontWeight: 600, flexShrink: 0,
              }}
            >
              {iniciais}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, color: '#fff', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {usuario?.nome || usuario?.email}
              </p>
              <p style={{ fontSize: 11, color: 'var(--sidebar-texto)', margin: 0 }}>{ROLE_LABEL[usuario?.role] || ''}</p>
            </div>
            <button
              onClick={aoSair}
              title="Sair"
              style={{ background: 'transparent', border: 'none', color: 'var(--sidebar-texto)', display: 'flex', padding: 4 }}
            >
              <LogOut size={17} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </aside>

      <main className="conteudo-principal" style={{ flex: 1, minWidth: 0, padding: '1.75rem 2.25rem', overflowX: 'hidden' }}>
        <Outlet />
      </main>
      </div>
    </div>
  );
}
