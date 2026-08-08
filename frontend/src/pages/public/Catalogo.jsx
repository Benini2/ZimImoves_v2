import { useEffect, useState } from 'react';
import { SlidersHorizontal, X, Building2 } from 'lucide-react';
import api from '../../api';
import ImovelCard from '../../components/ImovelCard';

const VAZIO = { tipo: '', cidade: '', bairro: '', precoMin: '', precoMax: '' };

export default function Catalogo() {
  const [imoveis, setImoveis] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [filtros, setFiltros] = useState(VAZIO);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    api.get('/imoveis/publico/cidades').then(({ data }) => setCidades(data));
  }, []);

  useEffect(() => {
    setCarregando(true);
    const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== ''));
    api.get('/imoveis/publico', { params }).then(({ data }) => {
      setImoveis(data);
      setCarregando(false);
    });
  }, [filtros]);

  const temFiltro = Object.values(filtros).some((v) => v !== '');
  const rotuloCampo = { fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--texto-secundario)', display: 'block', marginBottom: 6 };

  return (
    <div style={{ background: 'var(--fundo)', borderTop: '1px solid var(--borda)' }}>
      <div className="container" style={{ padding: '3.5rem 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span className="badge-eyebrow">Catálogo</span>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 800, margin: '8px 0 0' }}>Nosso catálogo</h1>
          <p style={{ fontSize: 15, color: 'var(--texto-secundario)', margin: '10px 0 0' }}>Explore todas as opções disponíveis e encontre o imóvel ideal.</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--borda)', borderRadius: 16, padding: '1.5rem', boxShadow: '0 1px 2px rgba(20,20,20,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <SlidersHorizontal size={16} color="var(--cor-primaria)" />
            <span style={{ fontSize: 14, fontWeight: 600 }}>Filtrar imóveis</span>
          </div>

          <div className="grid-filtros">
            <div>
              <label style={rotuloCampo}>Cidade</label>
              <select style={{ width: '100%' }} value={filtros.cidade} onChange={(e) => setFiltros({ ...filtros, cidade: e.target.value })}>
                <option value="">Todas as cidades</option>
                {cidades.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={rotuloCampo}>Bairro</label>
              <input style={{ width: '100%' }} placeholder="Todos os bairros" value={filtros.bairro} onChange={(e) => setFiltros({ ...filtros, bairro: e.target.value })} />
            </div>
            <div>
              <label style={rotuloCampo}>Tipo</label>
              <select style={{ width: '100%' }} value={filtros.tipo} onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}>
                <option value="">Todos os tipos</option>
                <option value="apartamento">Apartamento</option>
                <option value="casa">Casa</option>
                <option value="terreno">Terreno</option>
                <option value="sala_comercial">Sala comercial</option>
              </select>
            </div>
            <div>
              <label style={rotuloCampo}>Preço (mín. / máx.)</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="number" placeholder="Mín." style={{ width: '50%' }} value={filtros.precoMin} onChange={(e) => setFiltros({ ...filtros, precoMin: e.target.value })} />
                <input type="number" placeholder="Máx." style={{ width: '50%' }} value={filtros.precoMax} onChange={(e) => setFiltros({ ...filtros, precoMax: e.target.value })} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderTop: '1px solid var(--borda)', marginTop: 20, paddingTop: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--texto-secundario)', margin: 0 }}>
              <strong style={{ color: 'var(--cor-primaria)' }}>{imoveis.length}</strong> {imoveis.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
            </p>
            {temFiltro && (
              <button onClick={() => setFiltros(VAZIO)} className="btn-secundario" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                <X size={14} /> Limpar filtros
              </button>
            )}
          </div>
        </div>

        {carregando ? (
          <p style={{ color: 'var(--texto-secundario)', textAlign: 'center', marginTop: 40 }}>Carregando...</p>
        ) : imoveis.length === 0 ? (
          <div style={{ marginTop: 40, borderRadius: 16, border: '1px dashed var(--borda)', background: '#fff', padding: '3rem', textAlign: 'center' }}>
            <Building2 size={32} color="var(--texto-secundario)" style={{ margin: '0 auto' }} />
            <p style={{ fontSize: 16, fontWeight: 600, margin: '14px 0 4px' }}>Nenhum imóvel encontrado</p>
            <p style={{ fontSize: 13, color: 'var(--texto-secundario)', margin: 0 }}>Tente ajustar os filtros para ver mais opções.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginTop: 40 }}>
            {imoveis.map((imovel) => (
              <ImovelCard key={imovel.id} imovel={imovel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
