import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { CONTATO } from '../../config/contato';
import '../../styles/vitrine.css';

const LINKS = [
  { to: '/', label: 'Destaques', fim: true },
  { to: '/catalogo', label: 'Catálogo' },
  { to: '/contatos', label: 'Contatos' },
];

function Logo() {
  return (
    <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
      <img src="/images/logo-completa.png" alt="Zim Imóveis" className="logo-header" />
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
        <div className="container footer-conteudo">
          <div className="footer-topo">
            <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
              <img src="/images/logo-completa-branca.png" alt="Zim Imóveis" className="footer-logo" />
            </Link>
            <span className="footer-creci">CRECI {CONTATO.creci}</span>
          </div>
          <nav className="footer-nav">
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to}>{l.label}</Link>
            ))}
          </nav>
          <p className="footer-copy">
            © {new Date().getFullYear()} Zim Imóveis. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
