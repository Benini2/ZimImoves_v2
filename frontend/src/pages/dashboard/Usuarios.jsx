import { useEffect, useState } from 'react';
import { UserPlus, Trash2, Pencil, X } from 'lucide-react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

const ROLE_LABEL = {
  master: 'Master',
  corretor: 'Corretor',
  visualizador: 'Visualizador',
};

const ROLE_COR = {
  master: { fundo: '#fbeae7', cor: 'var(--cor-primaria)' },
  corretor: { fundo: '#e3f7ea', cor: '#1f9d55' },
  visualizador: { fundo: '#e8f0fe', cor: '#2f6fed' },
};

const VAZIO = { nome: '', email: '', senha: '', role: 'corretor' };

export default function Usuarios() {
  const { usuario: usuarioLogado } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState(VAZIO);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    setCarregando(true);
    const { data } = await api.get('/usuarios');
    setUsuarios(data);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  function abrirNovo() {
    setEditandoId(null);
    setForm(VAZIO);
    setErro('');
    setModalAberto(true);
  }

  function abrirEdicao(u) {
    setEditandoId(u.id);
    setForm({ nome: u.nome, email: u.email, senha: '', role: u.role });
    setErro('');
    setModalAberto(true);
  }

  async function salvar(e) {
    e.preventDefault();
    setErro('');
    if (!form.nome || !form.email || (!editandoId && !form.senha)) {
      setErro('Preencha nome, e-mail e senha.');
      return;
    }
    setSalvando(true);
    try {
      if (editandoId) {
        await api.put(`/usuarios/${editandoId}`, form);
      } else {
        await api.post('/usuarios', form);
      }
      setModalAberto(false);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Não foi possível salvar.');
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(u) {
    if (!confirm(`Excluir o acesso de ${u.nome}?`)) return;
    try {
      await api.delete(`/usuarios/${u.id}`);
      carregar();
    } catch (err) {
      alert(err.response?.data?.erro || 'Não foi possível excluir.');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>Usuários</h1>
          <p style={{ fontSize: 13, color: 'var(--texto-secundario)', margin: '4px 0 0' }}>
            Quem tem acesso ao painel, e o que cada um pode fazer.
          </p>
        </div>
        <button onClick={abrirNovo} className="btn-primario" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserPlus size={16} /> Novo usuário
        </button>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--borda)', borderRadius: 12, boxShadow: '0 1px 2px rgba(20,20,20,0.03)' }}>
        {carregando ? (
          <p style={{ color: 'var(--texto-secundario)', textAlign: 'center', padding: '2.5rem' }}>Carregando...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--texto-secundario)', background: '#fafaf8' }}>
                <th style={{ padding: '10px 20px', fontWeight: 500 }}>Nome</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>E-mail</th>
                <th style={{ padding: '10px 12px', fontWeight: 500 }}>Papel</th>
                <th style={{ padding: '10px 20px', fontWeight: 500, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const corPapel = ROLE_COR[u.role];
                const vocêMesmo = u.id === usuarioLogado?.id;
                return (
                  <tr key={u.id} style={{ borderTop: '1px solid var(--borda)' }}>
                    <td style={{ padding: '12px 20px' }}>
                      {u.nome} {vocêMesmo && <span style={{ fontSize: 11, color: 'var(--texto-secundario)' }}>(você)</span>}
                    </td>
                    <td style={{ padding: '12px' }}>{u.email}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20, background: corPapel.fundo, color: corPapel.cor }}>
                        {ROLE_LABEL[u.role]}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <button onClick={() => abrirEdicao(u)} style={{ background: 'none', border: 'none', color: 'var(--texto-secundario)', padding: 6, display: 'inline-flex' }} title="Editar">
                        <Pencil size={15} />
                      </button>
                      {!vocêMesmo && (
                        <button onClick={() => excluir(u)} style={{ background: 'none', border: 'none', color: 'var(--cor-primaria)', padding: 6, display: 'inline-flex' }} title="Excluir">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modalAberto && (
        <div
          onClick={() => setModalAberto(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,15,15,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={salvar}
            style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 400 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{editandoId ? 'Editar usuário' : 'Novo usuário'}</p>
              <button type="button" onClick={() => setModalAberto(false)} style={{ background: 'transparent', border: 'none', color: 'var(--texto-secundario)', display: 'flex' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input placeholder="Nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
              <input placeholder="E-mail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input
                placeholder={editandoId ? 'Nova senha (deixe em branco pra manter)' : 'Senha'}
                type="password"
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
              />
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--texto-secundario)', display: 'block', marginBottom: 6 }}>PAPEL</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ width: '100%' }}>
                  <option value="corretor">Corretor — cadastra, edita e exclui</option>
                  <option value="visualizador">Visualizador — só consegue ver</option>
                  <option value="master">Master — gerencia usuários</option>
                </select>
              </div>
            </div>

            {erro && <p className="erro" style={{ marginTop: 12 }}>{erro}</p>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button type="button" onClick={() => setModalAberto(false)} className="btn-secundario">Cancelar</button>
              <button type="submit" className="btn-primario" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
