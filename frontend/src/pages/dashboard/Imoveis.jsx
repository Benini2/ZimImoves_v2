import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Hourglass, CheckCircle2, Tag, ImageOff, Star, List, LayoutGrid } from 'lucide-react';
import api, { ARQUIVOS_URL } from '../../api';
import { useAuth } from '../../context/AuthContext';

const TIPO_LABEL = {
  apartamento: 'Apartamento',
  casa: 'Casa',
  terreno: 'Terreno',
  sala_comercial: 'Sala comercial',
};

const STATUS_INFO = {
  postado: { label: 'Postado', cor: '#1f9d55', fundo: '#e3f7ea' },
  nao_postado: { label: 'Não postado', cor: '#c9820a', fundo: '#fbf0dd' },
  vendido: { label: 'Vendido', cor: 'var(--cor-primaria)', fundo: '#fbeae7' },
};

function urlCapa(foto) {
  if (!foto) return null;
  return foto.startsWith('http') ? foto : `${ARQUIVOS_URL}${foto}`;
}

export default function Imoveis() {
  const navigate = useNavigate();
  const { podeEditar } = useAuth();
  const [imoveis, setImoveis] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [cidades, setCidades] = useState([]);
  const [filtros, setFiltros] = useState({ status: '', tipo: '', cidade: '', bairro: '', precoMin: '', precoMax: '' });
  const [carregando, setCarregando] = useState(true);
  const [visualizacao, setVisualizacao] = useState('lista'); // 'lista' ou 'grade'

  async function carregar() {
    setCarregando(true);
    const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== ''));
    const [resImoveis, resResumo] = await Promise.all([
      api.get('/imoveis', { params }),
      api.get('/imoveis/resumo'),
    ]);
    setImoveis(resImoveis.data);
    setResumo(resResumo.data);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, [filtros]);

  // Lista de cidades pro filtro (só as que já têm imóvel cadastrado) — carrega uma vez
  useEffect(() => {
    api.get('/imoveis/cidades').then(({ data }) => setCidades(data));
  }, []);

  // Clicar num card de resumo filtra a lista por aquele status (clicar de novo tira o filtro)
  function aoClicarCardResumo(status) {
    setFiltros((f) => ({ ...f, status: f.status === status ? '' : status }));
  }

  async function alternarDestaque(e, imovel) {
    e.stopPropagation();
    const novoValor = !(imovel.destaque === 1 || imovel.destaque === true);
    setImoveis((lista) => lista.map((i) => (i.id === imovel.id ? { ...i, destaque: novoValor } : i)));
    await api.patch(`/imoveis/${imovel.id}/destaque`, { destaque: novoValor });
  }

  async function alternarStatus(e, id, status) {
    e.stopPropagation();
    setImoveis((lista) => lista.map((i) => (i.id === id ? { ...i, status } : i)));
    await api.patch(`/imoveis/${id}/status`, { status });
    if (filtros.status) carregar(); // se tiver filtro de status ativo, atualiza a lista
  }

  const cardsResumo = [
    { label: 'Total de imóveis', valor: resumo?.total, icone: Building2, cor: '#2f6fed', fundo: '#e8f0fe', status: '' },
    { label: 'Não postados', valor: resumo?.naoPostados, icone: Hourglass, cor: '#c9820a', fundo: '#fbf0dd', status: 'nao_postado' },
    { label: 'Postados', valor: resumo?.postados, icone: CheckCircle2, cor: '#1f9d55', fundo: '#e3f7ea', status: 'postado' },
    { label: 'Vendidos', valor: resumo?.vendidos, icone: Tag, cor: 'var(--cor-primaria)', fundo: '#fbeae7', status: 'vendido' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>Imóveis</h1>
        {podeEditar && (
          <button onClick={() => navigate('/dashboard/imoveis/novo')} className="btn-primario">+ Cadastrar imóvel</button>
        )}
      </div>

      {resumo && (
        <div className="grid-resumo" style={{ marginBottom: 22 }}>
          {cardsResumo.map(({ label, valor, icone: Icone, cor, fundo, status }) => {
            const ativo = filtros.status === status && status !== '';
            return (
              <button
                key={label}
                onClick={() => aoClicarCardResumo(status)}
                style={{
                  background: '#fff',
                  border: ativo ? `1px solid ${cor}` : '1px solid var(--borda)',
                  outline: ativo ? `1px solid ${cor}` : 'none',
                  borderRadius: 12, padding: '1.1rem', textAlign: 'left', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 2px rgba(20,20,20,0.03)',
                }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 10, background: fundo, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icone size={20} strokeWidth={1.8} color={cor} />
                </div>
                <div>
                  <p style={{ fontSize: 12.5, color: 'var(--texto-secundario)', margin: 0 }}>{label}</p>
                  <p style={{ fontSize: 22, fontWeight: 600, margin: '2px 0 0' }}>{valor}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div style={{ background: '#fff', border: '1px solid var(--borda)', borderRadius: 12, boxShadow: '0 1px 2px rgba(20,20,20,0.03)' }}>
        <div style={{ padding: '1.1rem 1.25rem', borderBottom: '1px solid var(--borda)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <p style={{ fontWeight: 500, fontSize: 15, margin: 0 }}>Todos os imóveis</p>
            <div style={{ display: 'flex', border: '1px solid var(--borda)', borderRadius: 8, overflow: 'hidden' }}>
              <button
                onClick={() => setVisualizacao('lista')}
                title="Ver em lista"
                style={{ display: 'flex', padding: '6px 8px', border: 'none', background: visualizacao === 'lista' ? 'var(--fundo)' : '#fff', color: visualizacao === 'lista' ? 'var(--texto)' : 'var(--texto-secundario)' }}
              >
                <List size={16} strokeWidth={1.8} />
              </button>
              <button
                onClick={() => setVisualizacao('grade')}
                title="Ver em grade"
                style={{ display: 'flex', padding: '6px 8px', border: 'none', borderLeft: '1px solid var(--borda)', background: visualizacao === 'grade' ? 'var(--fundo)' : '#fff', color: visualizacao === 'grade' ? 'var(--texto)' : 'var(--texto-secundario)' }}
              >
                <LayoutGrid size={16} strokeWidth={1.8} />
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select value={filtros.status} onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}>
              <option value="">Status: todos</option>
              <option value="postado">Postado</option>
              <option value="nao_postado">Não postado</option>
              <option value="vendido">Vendido</option>
            </select>
            <select value={filtros.tipo} onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}>
              <option value="">Tipo: todos</option>
              <option value="apartamento">Apartamento</option>
              <option value="casa">Casa</option>
              <option value="terreno">Terreno</option>
              <option value="sala_comercial">Sala comercial</option>
            </select>
            <select value={filtros.cidade} onChange={(e) => setFiltros({ ...filtros, cidade: e.target.value })}>
              <option value="">Cidade: todas</option>
              {cidades.map((c) => (
                <option key={c.cidade} value={c.cidade}>{c.cidade} ({c.total})</option>
              ))}
            </select>
            <input
              placeholder="Bairro" style={{ width: 120 }}
              value={filtros.bairro} onChange={(e) => setFiltros({ ...filtros, bairro: e.target.value })}
            />
            <input
              type="number" placeholder="Preço min" style={{ width: 100 }}
              value={filtros.precoMin} onChange={(e) => setFiltros({ ...filtros, precoMin: e.target.value })}
            />
            <input
              type="number" placeholder="Preço max" style={{ width: 100 }}
              value={filtros.precoMax} onChange={(e) => setFiltros({ ...filtros, precoMax: e.target.value })}
            />
          </div>
        </div>

        <div style={{ padding: carregando || imoveis.length === 0 ? '2.5rem 1.25rem' : (visualizacao === 'grade' ? '1.25rem' : 0) }}>
          {carregando ? (
            <p style={{ color: 'var(--texto-secundario)', textAlign: 'center', margin: 0 }}>Carregando...</p>
          ) : imoveis.length === 0 ? (
            <p style={{ color: 'var(--texto-secundario)', textAlign: 'center', margin: 0 }}>Nenhum imóvel encontrado com esses filtros.</p>
          ) : visualizacao === 'grade' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {imoveis.map((imovel) => {
                const capa = urlCapa(imovel.foto_capa);
                const destacado = imovel.destaque === 1 || imovel.destaque === true;
                const status = STATUS_INFO[imovel.status];
                return (
                  <div
                    key={imovel.id}
                    className="linha-clicavel"
                    onClick={() => navigate(`/dashboard/imoveis/${imovel.id}/detalhes`)}
                    style={{ border: '1px solid var(--borda)', borderRadius: 12, overflow: 'hidden' }}
                  >
                    <div style={{ position: 'relative', height: 140, background: capa ? `url(${capa}) center/cover` : 'var(--fundo)', display: capa ? 'block' : 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {!capa && <ImageOff size={22} color="var(--texto-secundario)" />}
                      {podeEditar ? (
                        <button
                          onClick={(e) => alternarDestaque(e, imovel)}
                          title="Destaque"
                          style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Star size={14} fill={destacado ? 'var(--cor-primaria)' : 'none'} color={destacado ? 'var(--cor-primaria)' : '#8a8a86'} />
                        </button>
                      ) : destacado ? (
                        <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(255,255,255,0.9)', borderRadius: '50%', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Star size={14} fill="var(--cor-primaria)" color="var(--cor-primaria)" />
                        </div>
                      ) : null}
                      <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 20, background: status.fundo, color: status.cor }}>
                        {status.label}
                      </span>
                    </div>
                    <div style={{ padding: '10px 12px' }}>
                      <p style={{ fontSize: 13, color: 'var(--texto-secundario)', margin: '0 0 2px' }}>{TIPO_LABEL[imovel.tipo]}</p>
                      <p style={{ fontSize: 13, margin: '0 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {[imovel.bairro, imovel.cidade].filter(Boolean).join(' · ') || 'Localização não informada'}
                      </p>
                      <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px' }}>
                        {Number(imovel.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                      {podeEditar ? (
                        <select
                          value={imovel.status}
                          onChange={(e) => alternarStatus(e, imovel.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ fontSize: 12, padding: '4px 6px', width: '100%' }}
                        >
                          <option value="nao_postado">Não postado</option>
                          <option value="postado">Postado</option>
                          <option value="vendido">Vendido</option>
                        </select>
                      ) : (
                        <span style={{ fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 20, background: status.fundo, color: status.cor, display: 'inline-block' }}>
                          {status.label}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="tabela-scroll">
            <table style={{ width: '100%', minWidth: 700, tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: 13 }}>
              <colgroup>
                <col style={{ width: 68 }} />
                <col style={{ width: 130 }} />
                <col style={{ width: 130 }} />
                <col style={{ width: 130 }} />
                <col style={{ width: 110 }} />
                <col style={{ width: 130 }} />
                <col style={{ width: 130 }} />
              </colgroup>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--texto-secundario)', background: '#fafaf8' }}>
                  <th style={{ padding: '10px 0 10px 20px', fontWeight: 500 }}></th>
                  <th style={{ padding: '10px 12px', fontWeight: 500 }}>Tipo</th>
                  <th style={{ padding: '10px 12px', fontWeight: 500 }}>Cidade</th>
                  <th style={{ padding: '10px 12px', fontWeight: 500 }}>Bairro</th>
                  <th style={{ padding: '10px 12px', fontWeight: 500 }}>Terreno</th>
                  <th style={{ padding: '10px 12px', fontWeight: 500 }}>Preço</th>
                  <th style={{ padding: '10px 20px', fontWeight: 500 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {imoveis.map((imovel) => {
                  const capa = urlCapa(imovel.foto_capa);
                  const destacado = imovel.destaque === 1 || imovel.destaque === true;
                  return (
                    <tr
                      key={imovel.id}
                      className="linha-clicavel"
                      onClick={() => navigate(`/dashboard/imoveis/${imovel.id}/detalhes`)}
                      style={{ borderTop: '1px solid var(--borda)' }}
                    >
                      <td style={{ padding: '8px 12px 8px 20px' }}>
                        <div style={{ position: 'relative', width: 46, height: 46 }}>
                          {capa ? (
                            <div style={{ width: 46, height: 46, borderRadius: 8, background: `url(${capa}) center/cover`, border: '1px solid var(--borda)' }} />
                          ) : (
                            <div style={{ width: 46, height: 46, borderRadius: 8, background: 'var(--fundo)', border: '1px solid var(--borda)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ImageOff size={16} color="var(--texto-secundario)" />
                            </div>
                          )}
                          {podeEditar ? (
                            <button
                              onClick={(e) => alternarDestaque(e, imovel)}
                              title="Destaque"
                              style={{
                                position: 'absolute', bottom: -5, right: -5, background: '#fff', border: '1px solid var(--borda)',
                                borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                            >
                              <Star size={11} fill={destacado ? 'var(--cor-primaria)' : 'none'} color={destacado ? 'var(--cor-primaria)' : '#8a8a86'} />
                            </button>
                          ) : destacado ? (
                            <div style={{ position: 'absolute', bottom: -5, right: -5, background: '#fff', border: '1px solid var(--borda)', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Star size={11} fill="var(--cor-primaria)" color="var(--cor-primaria)" />
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td style={{ padding: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{TIPO_LABEL[imovel.tipo]}</td>
                      <td style={{ padding: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{imovel.cidade || '-'}</td>
                      <td style={{ padding: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{imovel.bairro || '-'}</td>
                      <td style={{ padding: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {imovel.area_terreno ? `${imovel.area_terreno}m²` : '-'}
                      </td>
                      <td style={{ padding: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {Number(imovel.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td style={{ padding: '8px 20px' }} onClick={(e) => e.stopPropagation()}>
                        {podeEditar ? (
                          <select
                            value={imovel.status}
                            onChange={(e) => alternarStatus(e, imovel.id, e.target.value)}
                            style={{ fontSize: 12, padding: '4px 6px' }}
                          >
                            <option value="nao_postado">Não postado</option>
                            <option value="postado">Postado</option>
                            <option value="vendido">Vendido</option>
                          </select>
                        ) : (
                          <span style={{ fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 20, background: STATUS_INFO[imovel.status].fundo, color: STATUS_INFO[imovel.status].cor }}>
                            {STATUS_INFO[imovel.status].label}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
