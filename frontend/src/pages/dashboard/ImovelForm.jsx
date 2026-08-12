import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, Star, Eye, EyeOff } from 'lucide-react';
import api from '../../api';
import ImagemUpload from '../../components/ImagemUpload';
import GaleriaUpload from '../../components/GaleriaUpload';

// Lista fixa de comodidades. Itens fora dela podem ser digitados à mão no formulário.
const COMODIDADES_FIXAS = [
  'Salão de festas', 'Lavanderia', 'Quintal', 'Churrasqueira',
  'Sacada', 'Portão elétrico', 'Piscina', 'Elevador', 'Área de serviço',
];

const VAZIO = {
  nome: '', preco: '', tipo: 'apartamento', status: 'nao_postado',
  cidade: '', estado: '', bairro: '', quartos: '', suites: '', vagas: '',
  areaTerreno: '', areaConstruida: '', descricao: '', fotoCapa: '', fotos: [],
  comodidades: [], destaque: false,
  proprietarioNome: '', proprietarioContato: '', observacoes: '',
};

export default function ImovelForm() {
  const { id } = useParams();
  const editando = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState(VAZIO);
  const [itemLivre, setItemLivre] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!editando) return;
    api.get(`/imoveis/${id}`).then(({ data }) => {
      setForm({
        ...VAZIO,
        ...data,
        preco: data.preco ?? '',
        comodidades: data.comodidades || [],
        fotos: (data.fotos || []).map((f) => f.url),
        // O banco devolve em snake_case; o formulário usa camelCase — sem isso a capa, as áreas
        // e os dados do proprietário ficavam em branco ao editar um imóvel já existente.
        fotoCapa: data.foto_capa || '',
        areaTerreno: data.area_terreno ?? '',
        areaConstruida: data.area_construida ?? '',
        proprietarioNome: data.proprietario_nome || '',
        proprietarioContato: data.proprietario_contato || '',
        observacoes: data.observacoes || '',
      });
    });
  }, [id]);

  function setCampo(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function alternarComodidadeFixa(item) {
    setForm((f) => ({
      ...f,
      comodidades: f.comodidades.includes(item)
        ? f.comodidades.filter((c) => c !== item)
        : [...f.comodidades, item],
    }));
  }

  function adicionarItemLivre() {
    const valor = itemLivre.trim();
    if (!valor || form.comodidades.includes(valor)) return;
    setForm((f) => ({ ...f, comodidades: [...f.comodidades, valor] }));
    setItemLivre('');
  }

  function removerComodidade(item) {
    setForm((f) => ({ ...f, comodidades: f.comodidades.filter((c) => c !== item) }));
  }

  // Itens marcados que não fazem parte da lista fixa (foram digitados à mão)
  const itensLivres = form.comodidades.filter((c) => !COMODIDADES_FIXAS.includes(c));

  async function salvar(e) {
    e.preventDefault();
    setErro('');
    if (!form.nome || !form.preco || !form.tipo) {
      setErro('Preencha nome, preço e tipo.');
      return;
    }
    setSalvando(true);
    try {
      if (editando) {
        await api.put(`/imoveis/${id}`, form);
      } else {
        await api.post('/imoveis', form);
      }
      navigate('/dashboard');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Não foi possível salvar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div style={{ maxWidth: 1080, overflowX: 'hidden' }}>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 20 }}>
        {editando ? 'Editar imóvel' : 'Cadastrar imóvel'}
      </h1>

      <form onSubmit={salvar} className="grid-form">
        <div style={{ background: '#fff', border: '1px solid var(--borda)', borderRadius: 12, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--texto-secundario)' }}>FOTO DE CAPA</label>
            <button
              type="button"
              onClick={() => setCampo('destaque', !form.destaque)}
              title={form.destaque ? 'Remover dos destaques' : 'Marcar como destaque'}
              style={{
                display: 'flex', alignItems: 'center', gap: 5, background: 'transparent', border: 'none',
                padding: 0, fontSize: 12, color: form.destaque ? 'var(--cor-primaria)' : 'var(--texto-secundario)',
              }}
            >
              <Star size={17} strokeWidth={1.8} fill={form.destaque ? 'var(--cor-primaria)' : 'none'} color={form.destaque ? 'var(--cor-primaria)' : 'currentColor'} />
              Destaque
            </button>
          </div>

          <ImagemUpload value={form.fotoCapa} onChange={(url) => setCampo('fotoCapa', url)} altura={280} />

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--texto-secundario)', display: 'block', marginBottom: 8 }}>STATUS</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                type="button"
                onClick={() => setCampo('status', 'postado')}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 6px',
                  borderRadius: 10, cursor: 'pointer', fontSize: 12,
                  border: form.status === 'postado' ? '1px solid #1f9d55' : '1px solid var(--borda)',
                  background: form.status === 'postado' ? '#e3f7ea' : '#fff',
                  color: form.status === 'postado' ? '#1f9d55' : 'var(--texto-secundario)',
                }}
              >
                <Eye size={18} strokeWidth={1.8} />
                Postado
              </button>
              <button
                type="button"
                onClick={() => setCampo('status', 'nao_postado')}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 6px',
                  borderRadius: 10, cursor: 'pointer', fontSize: 12,
                  border: form.status === 'nao_postado' ? '1px solid #c9820a' : '1px solid var(--borda)',
                  background: form.status === 'nao_postado' ? '#fbf0dd' : '#fff',
                  color: form.status === 'nao_postado' ? '#c9820a' : 'var(--texto-secundario)',
                }}
              >
                <EyeOff size={18} strokeWidth={1.8} />
                Não postado
              </button>
            </div>
            {form.status === 'vendido' && (
              <p style={{ fontSize: 11, color: 'var(--texto-secundario)', marginTop: 8 }}>
                Este imóvel está marcado como vendido. Para mudar isso, use a lista de imóveis.
              </p>
            )}
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--texto-secundario)', display: 'block', marginBottom: 6 }}>
              OUTRAS FOTOS
            </label>
            <GaleriaUpload value={form.fotos} onChange={(fotos) => setCampo('fotos', fotos)} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          <div style={{ background: '#fff', border: '1px solid var(--borda)', borderRadius: 12, padding: '1.25rem' }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--texto-secundario)', marginBottom: 10 }}>DADOS DO IMÓVEL</p>
            <div className="grid-2">
              <input placeholder="Nome" value={form.nome} onChange={(e) => setCampo('nome', e.target.value)} required />
              <input placeholder="Preço" type="number" value={form.preco} onChange={(e) => setCampo('preco', e.target.value)} required />
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--borda)', borderRadius: 12, padding: '1.25rem' }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--texto-secundario)', marginBottom: 10 }}>LOCALIZAÇÃO</p>
            <div className="grid-localizacao">
              <input placeholder="Bairro" value={form.bairro} onChange={(e) => setCampo('bairro', e.target.value)} />
              <input placeholder="Cidade" value={form.cidade} onChange={(e) => setCampo('cidade', e.target.value)} />
              <input placeholder="UF" maxLength={2} value={form.estado} onChange={(e) => setCampo('estado', e.target.value.toUpperCase())} />
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--borda)', borderRadius: 12, padding: '1.25rem' }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--texto-secundario)', marginBottom: 10 }}>CARACTERÍSTICAS</p>
            <select
              value={form.tipo}
              onChange={(e) => {
                const novoTipo = e.target.value;
                setForm((f) => {
                  const atualizado = { ...f, tipo: novoTipo };
                  if (novoTipo === 'terreno') {
                    // Terreno não tem quartos/suítes/vagas/área construída
                    atualizado.quartos = '';
                    atualizado.suites = '';
                    atualizado.vagas = '';
                    atualizado.areaConstruida = '';
                  } else if (novoTipo === 'apartamento') {
                    // Apartamento não tem área de terreno própria
                    atualizado.areaTerreno = '';
                  }
                  return atualizado;
                });
              }}
              style={{ width: '100%', marginBottom: 10 }}
            >
              <option value="apartamento">Apartamento</option>
              <option value="casa">Casa</option>
              <option value="terreno">Terreno</option>
              <option value="sala_comercial">Sala comercial</option>
            </select>
            <div className="grid-caracteristicas">
              {form.tipo === 'terreno' ? (
                // Terreno só tem área do terreno — não faz sentido quartos, suítes, vagas ou área construída
                <input placeholder="Área terreno m²" type="number" value={form.areaTerreno} onChange={(e) => setCampo('areaTerreno', e.target.value)} />
              ) : form.tipo === 'apartamento' ? (
                // Apartamento não tem área de terreno própria, só a área construída
                <>
                  <input placeholder="Quartos" type="number" value={form.quartos} onChange={(e) => setCampo('quartos', e.target.value)} />
                  <input placeholder="Suítes" type="number" value={form.suites} onChange={(e) => setCampo('suites', e.target.value)} />
                  <input placeholder="Vagas" type="number" value={form.vagas} onChange={(e) => setCampo('vagas', e.target.value)} />
                  <input placeholder="Área constr. m²" type="number" value={form.areaConstruida} onChange={(e) => setCampo('areaConstruida', e.target.value)} />
                </>
              ) : (
                // Casa, sala comercial etc. — todos os campos fazem sentido
                <>
                  <input placeholder="Quartos" type="number" value={form.quartos} onChange={(e) => setCampo('quartos', e.target.value)} />
                  <input placeholder="Suítes" type="number" value={form.suites} onChange={(e) => setCampo('suites', e.target.value)} />
                  <input placeholder="Vagas" type="number" value={form.vagas} onChange={(e) => setCampo('vagas', e.target.value)} />
                  <input placeholder="Área terreno m²" type="number" value={form.areaTerreno} onChange={(e) => setCampo('areaTerreno', e.target.value)} />
                  <input placeholder="Área constr. m²" type="number" value={form.areaConstruida} onChange={(e) => setCampo('areaConstruida', e.target.value)} />
                </>
              )}
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--borda)', borderRadius: 12, padding: '1.25rem' }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--texto-secundario)', marginBottom: 10 }}>ESTRUTURA E COMODIDADES</p>
            <div className="grid-comodidades" style={{ marginBottom: 12 }}>
              {COMODIDADES_FIXAS.map((item) => (
                <label key={item} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={form.comodidades.includes(item)}
                    onChange={() => alternarComodidadeFixa(item)}
                    style={{ width: 14, height: 14 }}
                  />
                  {item}
                </label>
              ))}
            </div>

            {itensLivres.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                {itensLivres.map((item) => (
                  <span key={item} style={{ fontSize: 12, background: '#fbeae7', color: 'var(--cor-primaria)', padding: '4px 10px', borderRadius: 14 }}>
                    {item}{' '}
                    <button type="button" onClick={() => removerComodidade(item)} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, marginLeft: 4 }}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                placeholder="Adicionar item que não está na lista"
                value={itemLivre}
                onChange={(e) => setItemLivre(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); adicionarItemLivre(); } }}
                style={{ flex: 1 }}
              />
              <button type="button" className="btn-secundario" onClick={adicionarItemLivre}>Adicionar</button>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--borda)', borderRadius: 12, padding: '1.25rem' }}>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--texto-secundario)', marginBottom: 10 }}>DESCRIÇÃO</p>
            <textarea
              rows={4}
              style={{ width: '100%', resize: 'vertical' }}
              value={form.descricao}
              onChange={(e) => setCampo('descricao', e.target.value)}
            />
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--cor-primaria)', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Lock size={14} color="var(--cor-primaria)" />
              <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--cor-primaria)', margin: 0 }}>
                INFORMAÇÕES DO PROPRIETÁRIO — VISÍVEL SÓ NO PAINEL
              </p>
            </div>
            <p style={{ fontSize: 12, color: 'var(--texto-secundario)', margin: '0 0 12px' }}>
              Esses dados nunca aparecem na vitrine pública, só aqui no painel para quem está logado.
            </p>
            <div className="grid-2" style={{ marginBottom: 10 }}>
              <input
                placeholder="Nome do proprietário"
                value={form.proprietarioNome}
                onChange={(e) => setCampo('proprietarioNome', e.target.value)}
              />
              <input
                placeholder="Contato (telefone/e-mail)"
                value={form.proprietarioContato}
                onChange={(e) => setCampo('proprietarioContato', e.target.value)}
              />
            </div>
            <textarea
              rows={3}
              placeholder="Observações internas (negociação, condições, histórico...)"
              style={{ width: '100%', resize: 'vertical' }}
              value={form.observacoes}
              onChange={(e) => setCampo('observacoes', e.target.value)}
            />
          </div>

          {erro && <p className="erro">{erro}</p>}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" className="btn-secundario" onClick={() => navigate('/dashboard')}>Cancelar</button>
            <button type="submit" className="btn-primario" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar imóvel'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
