import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star, Lock, ImageOff, X, ChevronLeft, ChevronRight } from 'lucide-react';
import api, { ARQUIVOS_URL } from '../../api';

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

function urlCompleta(caminho) {
  if (!caminho) return null;
  return caminho.startsWith('http') ? caminho : `${ARQUIVOS_URL}${caminho}`;
}

export default function ImovelDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [imovel, setImovel] = useState(null);
  const [indiceAberto, setIndiceAberto] = useState(null); // índice da foto aberta no lightbox

  useEffect(() => {
    api.get(`/imoveis/${id}`).then(({ data }) => setImovel(data));
  }, [id]);

  async function excluir() {
    if (!confirm('Excluir este imóvel? Essa ação não pode ser desfeita.')) return;
    await api.delete(`/imoveis/${id}`);
    navigate('/dashboard');
  }

  if (!imovel) return <p style={{ color: 'var(--texto-secundario)' }}>Carregando...</p>;

  const status = STATUS_INFO[imovel.status];
  const capa = urlCompleta(imovel.foto_capa);
  const fotosGaleria = (imovel.fotos || []).map((f) => urlCompleta(f.url));
  // Todas as fotos juntas, na ordem em que aparecem na tela, pra navegar no lightbox
  const todasFotos = [capa, ...fotosGaleria].filter(Boolean);

  return (
    <div style={{ maxWidth: 1000 }}>
      <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--texto-secundario)', marginBottom: 16 }}>
        <ArrowLeft size={16} /> Voltar para imóveis
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>{imovel.nome}</h1>
            {imovel.destaque === 1 || imovel.destaque === true ? (
              <Star size={18} fill="var(--cor-primaria)" color="var(--cor-primaria)" />
            ) : null}
          </div>
          <p style={{ fontSize: 13, color: 'var(--texto-secundario)', margin: '4px 0 0' }}>
            {[imovel.bairro, imovel.cidade, imovel.estado].filter(Boolean).join(' · ') || 'Localização não informada'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 500, padding: '5px 12px', borderRadius: 20, background: status.fundo, color: status.cor }}>
            {status.label}
          </span>
          <Link to={`/dashboard/imoveis/${id}`} className="btn-secundario">Editar</Link>
          <button onClick={excluir} className="btn-primario">Excluir</button>
        </div>
      </div>

      <div className="grid-fotos-detalhe" style={{ marginBottom: 20 }}>
        <div
          className="foto-clicavel"
          onClick={() => capa && setIndiceAberto(0)}
          style={{ height: 320, borderRadius: 12, background: capa ? `url(${capa}) center/cover` : 'var(--fundo)', border: '1px solid var(--borda)', display: capa ? 'block' : 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
        >
          {!capa && <ImageOff size={28} color="var(--texto-secundario)" />}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '1fr', gap: 12, height: 320 }}>
          {fotosGaleria.length > 0 ? (
            fotosGaleria.slice(0, 4).map((url, i) => (
              <div
                key={url}
                className="foto-clicavel"
                onClick={() => setIndiceAberto(i + 1)}
                style={{ borderRadius: 12, background: `url(${url}) center/cover`, border: '1px solid var(--borda)', overflow: 'hidden' }}
              />
            ))
          ) : (
            <div style={{ gridColumn: '1 / -1', gridRow: '1 / -1', borderRadius: 12, border: '1px dashed var(--borda)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--texto-secundario)', fontSize: 13 }}>
              Sem fotos adicionais
            </div>
          )}
        </div>
      </div>

      {/* Linha 1: Dados do imóvel | Descrição */}
      <div className="grid-duas-colunas" style={{ marginBottom: 16 }}>
        <div style={{ background: '#fff', border: '1px solid var(--borda)', borderRadius: 12, padding: '1.25rem' }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--texto-secundario)', marginBottom: 12 }}>DADOS DO IMÓVEL</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Campo label="Preço" valor={Number(imovel.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
            <Campo label="Tipo" valor={TIPO_LABEL[imovel.tipo]} />
            <Campo label="Quartos" valor={imovel.quartos ?? '-'} />
            <Campo label="Suítes" valor={imovel.suites ?? '-'} />
            <Campo label="Vagas" valor={imovel.vagas ?? '-'} />
            <Campo label="Área terreno" valor={imovel.area_terreno ? `${imovel.area_terreno}m²` : '-'} />
            <Campo label="Área construída" valor={imovel.area_construida ? `${imovel.area_construida}m²` : '-'} />
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--borda)', borderRadius: 12, padding: '1.25rem' }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--texto-secundario)', marginBottom: 10 }}>DESCRIÇÃO</p>
          <p style={{ fontSize: 14, margin: 0, lineHeight: 1.6 }}>{imovel.descricao || 'Sem descrição.'}</p>
        </div>
      </div>

      {/* Linha 2: Estrutura e comodidades | Informações do proprietário */}
      <div className="grid-duas-colunas">
        <div style={{ background: '#fff', border: '1px solid var(--borda)', borderRadius: 12, padding: '1.25rem' }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--texto-secundario)', marginBottom: 10 }}>ESTRUTURA E COMODIDADES</p>
          {imovel.comodidades?.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {imovel.comodidades.map((item) => (
                <span key={item} style={{ fontSize: 12, background: 'var(--fundo)', padding: '4px 10px', borderRadius: 14 }}>{item}</span>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--texto-secundario)', margin: 0 }}>Nenhuma comodidade informada.</p>
          )}
        </div>

        <div style={{ background: '#fff', border: '1px solid var(--cor-primaria)', borderRadius: 12, padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Lock size={14} color="var(--cor-primaria)" />
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--cor-primaria)', margin: 0 }}>
              INFORMAÇÕES DO PROPRIETÁRIO — SÓ VOCÊ VÊ ISSO
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Campo label="Nome do proprietário" valor={imovel.proprietario_nome || 'Não informado'} />
            <Campo label="Contato" valor={imovel.proprietario_contato || 'Não informado'} />
            <div>
              <p style={{ fontSize: 11, color: 'var(--texto-secundario)', margin: '0 0 4px' }}>Observações</p>
              <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{imovel.observacoes || 'Nenhuma observação.'}</p>
            </div>
          </div>
        </div>
      </div>

      {indiceAberto !== null && (
        <Lightbox
          fotos={todasFotos}
          indice={indiceAberto}
          aoFechar={() => setIndiceAberto(null)}
          aoMudar={setIndiceAberto}
        />
      )}
    </div>
  );
}

function Campo({ label, valor }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: 'var(--texto-secundario)', margin: '0 0 2px' }}>{label}</p>
      <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{valor}</p>
    </div>
  );
}

// Visualizador de fotos em tela cheia, com fundo desfocado e navegação entre as imagens
function Lightbox({ fotos, indice, aoFechar, aoMudar }) {
  function anterior(e) {
    e.stopPropagation();
    aoMudar((indice - 1 + fotos.length) % fotos.length);
  }
  function proxima(e) {
    e.stopPropagation();
    aoMudar((indice + 1) % fotos.length);
  }

  return (
    <div
      onClick={aoFechar}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,15,15,0.75)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <button
        onClick={aoFechar}
        style={{ position: 'absolute', top: 20, right: 24, background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
      >
        <X size={20} />
      </button>

      {fotos.length > 1 && (
        <button
          onClick={anterior}
          style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
        >
          <ChevronLeft size={22} />
        </button>
      )}

      <img
        src={fotos[indice]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '85vw', maxHeight: '85vh', borderRadius: 10, boxShadow: '0 10px 40px rgba(0,0,0,0.4)' }}
      />

      {fotos.length > 1 && (
        <button
          onClick={proxima}
          style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%', width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
        >
          <ChevronRight size={22} />
        </button>
      )}

      {fotos.length > 1 && (
        <p style={{ position: 'absolute', bottom: 24, color: '#fff', fontSize: 13 }}>{indice + 1} / {fotos.length}</p>
      )}
    </div>
  );
}
