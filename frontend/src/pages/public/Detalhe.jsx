import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft, MapPin, BedDouble, Bath, Square, Car, Building2,
  Check, Phone, MessageCircle, ChevronRight, ImageOff, Home as HomeIcon,
  X, ChevronLeft, Share2, Link as LinkIcon,
} from 'lucide-react';
import api, { ARQUIVOS_URL } from '../../api';

// TODO: trocar pelo telefone real da imobiliária
const WHATSAPP = '554933534273';
const TELEFONE_EXIBIDO = '(49) 3353-4273';

const TIPO_LABEL = {
  apartamento: 'Apartamento',
  casa: 'Casa',
  terreno: 'Terreno',
  sala_comercial: 'Sala comercial',
};

function urlCompleta(caminho) {
  if (!caminho) return null;
  return caminho.startsWith('http') ? caminho : `${ARQUIVOS_URL}${caminho}`;
}

export default function Detalhe() {
  const { id } = useParams();
  const [imovel, setImovel] = useState(null);
  const [erro, setErro] = useState(false);
  const [fotoAtiva, setFotoAtiva] = useState(0);
  const [lightboxAberto, setLightboxAberto] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);

  useEffect(() => {
    setFotoAtiva(0);
    api.get(`/imoveis/publico/${id}`)
      .then(({ data }) => setImovel(data))
      .catch(() => setErro(true));
  }, [id]);

  useEffect(() => {
    if (imovel) document.title = `${imovel.nome} — Zim Imóveis`;
  }, [imovel]);

  async function compartilhar() {
    const url = window.location.href;
    // No celular, abre o menu nativo de compartilhamento (WhatsApp, Instagram, etc. já aparecem lá)
    if (navigator.share) {
      try {
        await navigator.share({ title: imovel.nome, text: `Confira esse imóvel: ${imovel.nome}`, url });
      } catch {
        // pessoa cancelou o compartilhamento, tudo bem
      }
      return;
    }
    // No computador, copia o link
    await navigator.clipboard.writeText(url);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2000);
  }

  if (erro) {
    return (
      <div className="container" style={{ padding: '5rem 20px', textAlign: 'center' }}>
        <HomeIcon size={40} color="var(--texto-secundario)" style={{ margin: '0 auto' }} />
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '20px 0 8px' }}>Imóvel não encontrado</h1>
        <p style={{ color: 'var(--texto-secundario)', margin: '0 0 24px' }}>Este imóvel pode ter sido vendido ou removido do catálogo.</p>
        <Link to="/catalogo" className="btn-primario" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Voltar ao catálogo
        </Link>
      </div>
    );
  }

  if (!imovel) {
    return <div className="container" style={{ padding: '3rem 20px' }}><p style={{ color: 'var(--texto-secundario)' }}>Carregando...</p></div>;
  }

  const capa = urlCompleta(imovel.foto_capa);
  const fotos = [capa, ...(imovel.fotos || []).map((f) => urlCompleta(f.url))].filter(Boolean);
  const fotoAtual = fotos[fotoAtiva];
  const preco = Number(imovel.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const specs = [
    imovel.quartos ? { icone: BedDouble, label: 'Quartos', valor: imovel.quartos } : null,
    imovel.suites ? { icone: Bath, label: 'Suítes', valor: imovel.suites } : null,
    imovel.area_terreno ? { icone: Square, label: 'Área terreno', valor: `${imovel.area_terreno}m²` } : null,
    imovel.area_construida ? { icone: Square, label: 'Área construída', valor: `${imovel.area_construida}m²` } : null,
    imovel.vagas ? { icone: Car, label: 'Vagas', valor: imovel.vagas } : null,
    { icone: Building2, label: 'Tipo', valor: TIPO_LABEL[imovel.tipo] },
  ].filter(Boolean);

  return (
    <div className="container" style={{ padding: '2rem 20px 4rem', maxWidth: 1120 }}>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--texto-secundario)', marginBottom: 24, flexWrap: 'wrap' }}>
        <Link to="/" style={{ color: 'var(--texto-secundario)' }}>Início</Link>
        <ChevronRight size={13} />
        <Link to="/catalogo" style={{ color: 'var(--texto-secundario)' }}>Catálogo</Link>
        <ChevronRight size={13} />
        <span style={{ color: 'var(--texto)', fontWeight: 500 }}>{imovel.nome}</span>
      </nav>

      {/* minWidth:0 nos dois lados é o que evita a coluna da direita ser empurrada pra fora da tela
          quando o conteúdo (ex: muitas miniaturas de foto) tenta forçar uma largura maior */}
      <div className="grid-fotos-detalhe" style={{ alignItems: 'start' }}>
        <div style={{ minWidth: 0 }}>
          <div
            className="foto-clicavel"
            onClick={() => setLightboxAberto(true)}
            style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--borda)', aspectRatio: '4 / 3', background: 'var(--fundo)' }}
          >
            {fotoAtual ? (
              <div style={{ width: '100%', height: '100%', background: `url(${fotoAtual}) center/cover` }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageOff size={28} color="var(--texto-secundario)" />
              </div>
            )}
          </div>

          {fotos.length > 1 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 12, overflowX: 'auto', maxWidth: '100%', paddingBottom: 4 }}>
              {fotos.map((f, i) => (
                <button
                  key={f + i}
                  onClick={() => setFotoAtiva(i)}
                  style={{ width: 88, height: 66, flexShrink: 0, borderRadius: 10, overflow: 'hidden', padding: 0, border: i === fotoAtiva ? '2px solid var(--cor-primaria)' : '1px solid var(--borda)', background: `url(${f}) center/cover` }}
                />
              ))}
            </div>
          )}

          {imovel.descricao && (
            <div style={{ marginTop: 40 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 10px' }}>Sobre o imóvel</h2>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--texto-secundario)', margin: 0 }}>{imovel.descricao}</p>
            </div>
          )}

          {imovel.comodidades?.length > 0 && (
            <div style={{ marginTop: 36 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 14px' }}>Características</h2>
              <div className="grid-2" style={{ gap: 10 }}>
                {imovel.comodidades.map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#FBEAE7', color: 'var(--cor-primaria)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={13} />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(imovel.bairro || imovel.cidade) && (
            <div style={{ marginTop: 36 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 10px' }}>Localização</h2>
              <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--texto-secundario)', margin: 0 }}>
                <MapPin size={16} color="var(--cor-primaria)" />
                {[imovel.bairro, imovel.cidade, imovel.estado].filter(Boolean).join(', ')}
              </p>
            </div>
          )}
        </div>

        <aside style={{ position: 'sticky', top: 90, minWidth: 0 }}>
          <div style={{ background: '#fff', border: '1px solid var(--borda)', borderRadius: 16, padding: '1.5rem', boxShadow: '0 1px 2px rgba(20,20,20,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{imovel.nome}</h1>
              <button
                onClick={compartilhar}
                title="Compartilhar"
                style={{ flexShrink: 0, background: 'var(--fundo)', border: 'none', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--texto)' }}
              >
                {linkCopiado ? <LinkIcon size={15} color="#1f9d55" /> : <Share2 size={15} />}
              </button>
            </div>
            {linkCopiado && <p style={{ fontSize: 12, color: '#1f9d55', margin: '4px 0 0' }}>Link copiado!</p>}
            <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--texto-secundario)', margin: '8px 0 0' }}>
              <MapPin size={14} /> {[imovel.bairro, imovel.cidade].filter(Boolean).join(', ') || 'Localização a combinar'}
            </p>
            <p style={{ fontSize: 28, fontWeight: 800, color: 'var(--cor-primaria)', margin: '16px 0 0' }}>{preco}</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, borderTop: '1px solid var(--borda)', marginTop: 20, paddingTop: 20 }}>
              {specs.map((s) => (
                <div key={s.label} style={{ background: 'var(--fundo)', borderRadius: 10, padding: '10px 12px', minWidth: 0 }}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--texto-secundario)', margin: 0 }}>
                    <s.icone size={13} /> {s.label}
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 700, margin: '4px 0 0' }}>{s.valor}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--borda)', marginTop: 20, paddingTop: 20 }}>
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Olá! Tenho interesse no imóvel "${imovel.nome}".`)}`}
                target="_blank" rel="noreferrer"
                className="btn-primario"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}
              >
                <MessageCircle size={16} /> Agendar visita
              </a>
              <a href={`tel:+${WHATSAPP}`} className="btn-secundario" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none', background: '#fff' }}>
                <Phone size={16} /> {TELEFONE_EXIBIDO}
              </a>
            </div>
          </div>

          <Link to="/catalogo" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--texto-secundario)', marginTop: 14 }}>
            <ArrowLeft size={14} /> Voltar ao catálogo
          </Link>
        </aside>
      </div>

      {lightboxAberto && (
        <Lightbox
          fotos={fotos}
          indice={fotoAtiva}
          aoFechar={() => setLightboxAberto(false)}
          aoMudar={setFotoAtiva}
        />
      )}
    </div>
  );
}

// Visualizador em tela cheia: fundo desfocado, seta pra trocar de foto, fecha clicando fora
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
        background: 'rgba(15,15,15,0.8)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <button
        onClick={aoFechar}
        style={{ position: 'absolute', top: 20, right: 24, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
      >
        <X size={20} />
      </button>

      {fotos.length > 1 && (
        <button
          onClick={anterior}
          style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
        >
          <ChevronLeft size={22} />
        </button>
      )}

      <img
        src={fotos[indice]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '88vw', maxHeight: '86vh', borderRadius: 10, boxShadow: '0 10px 40px rgba(0,0,0,0.4)' }}
      />

      {fotos.length > 1 && (
        <button
          onClick={proxima}
          style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}
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
