import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { entrar } = useAuth();
  const navigate = useNavigate();

  async function aoEnviar(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      await entrar(email, senha);
      navigate('/dashboard');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Não foi possível entrar. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <form
        onSubmit={aoEnviar}
        style={{
          background: 'var(--superficie)',
          border: '1px solid var(--borda)',
          borderRadius: 12,
          padding: '2rem',
          width: '100%',
          maxWidth: 340,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <img src="/images/logo-icone.svg" alt="" style={{ height: 48, margin: '0 auto 10px', display: 'block', borderRadius: 10 }} />
          <h1 style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>Entrar no painel</h1>
          <p style={{ fontSize: 13, color: 'var(--texto-secundario)', margin: '4px 0 0' }}>
            Acesso restrito à equipe da imobiliária
          </p>
        </div>

        <label style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 4 }}>
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@gmail.com"
          />
        </label>

        <label style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 4 }}>
          Senha
          <input
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Sua senha"
          />
        </label>

        {erro && <p className="erro">{erro}</p>}

        <button type="submit" className="btn-primario" disabled={carregando} style={{ marginTop: 8 }}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
