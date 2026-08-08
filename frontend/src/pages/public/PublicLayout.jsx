import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const LINKS = [
  { to: '/', label: 'Destaques', fim: true },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/contatos', label: 'Contatos' },
];

function Logo() {
  return (
    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img src="/images/logo-icone.svg" alt="" style={{ height: 42, borderRadius: 10 }} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
        <span style={{ fontSize: 21, fontWeight: 800, color: 'var(--cor-texto)' }}>Zim</span>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--cor-texto-secundario)' }}>
          Imóveis
        </span>
      </div>
    </Link>
  );
}

export default function PublicLayout() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <header className="header-publico">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72, padding: '0 20px' }}>
          <Logo />

          <nav className="menu-desktop-publico" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {LINKS.map((l) => (
              <NavLink
                key={l.to} to={l.to} end={l.fim} className="link-menu-publico"
                style={({ isActive }) => (isActive ? { color: 'var(--cor-primaria)' } : undefined)}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <Link to="/contatos" className="btn-primario cta-desktop-publico" style={{ textDecoration: 'none', fontSize: 14 }}>
            Fale Conosco
          </Link>

          <button
            onClick={() => setMenuAberto((v) => !v)}
            className="menu-mobile-publico"
            style={{ background: 'transparent', border: 'none', color: 'var(--texto)', display: 'flex' }}
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
          >
            {menuAberto ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuAberto && (
          <div className="menu-mobile-publico" style={{ borderTop: '1px solid var(--borda)', padding: '0.75rem 20px 1.25rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {LINKS.map((l) => (
              <NavLink
                key={l.to} to={l.to} end={l.fim} onClick={() => setMenuAberto(false)}
                className="link-menu-publico" style={{ padding: '10px 12px' }}
              >
                {l.label}
              </NavLink>
            ))}
            <Link to="/contatos" onClick={() => setMenuAberto(false)} className="btn-primario" style={{ textDecoration: 'none', textAlign: 'center', marginTop: 8 }}>
              Fale Conosco
            </Link>
          </div>
        )}
      </header>

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer className="footer-publico">
        <div className="container" style={{ padding: '2.5rem 20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <img src="/images/logo-icone.svg" alt="" style={{ height: 32, borderRadius: 10 }} />
            <span style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>Zim Imóveis</span>
          </Link>
          <nav style={{ display: 'flex', gap: 20, fontSize: 13, flexWrap: 'wrap' }}>
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} style={{ color: 'rgba(255,255,255,0.75)' }}>{l.label}</Link>
            ))}
          </nav>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
            © {new Date().getFullYear()} Zim Imóveis. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
