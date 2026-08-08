import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, ChevronRight, Building2 } from 'lucide-react';
import api, { ARQUIVOS_URL } from '../../api';
import ImovelCard from '../../components/ImovelCard';

function urlCompleta(caminho) {
  if (!caminho) return null;
  return caminho.startsWith('http') ? caminho : `${ARQUIVOS_URL}${caminho}`;
}

// Decide se uma URL é vídeo só pela extensão do arquivo
function ehVideo(url) {
  return /\.(mp4|webm)$/i.test(url || '');
}

function Hero({ banners, indice, aoAvancar, config }) {
  const [linha1, linha2] = (config.hero_titulo || '').split('||');
  const videoRefs = useRef([]);

  // Foto: troca sozinha depois de 5s. Vídeo: não usa temporizador, quem avança é o
  // evento onEnded (só troca quando o vídeo terminar de tocar até o fim).
  useEffect(() => {
    if (banners.length < 2) return;
    const atual = banners[indice];
    if (!atual || ehVideo(atual.imagem_url)) return;

    const t = setTimeout(aoAvancar, 5000);
    return () => clearTimeout(t);
  }, [indice, banners, aoAvancar]);

  // Sempre que troca de banner: o vídeo que está ficando ativo recomeça do início,
  // os outros ficam pausados (evita gastar rede/processamento à toa em segundo plano).
  useEffect(() => {
    banners.forEach((banner, i) => {
      if (!ehVideo(banner.imagem_url)) return;
      const el = videoRefs.current[i];
      if (!el) return;
      if (i === indice) {
        el.currentTime = 0;
        el.play().catch(() => {});
      } else {
        el.pause();
      }
    });
  }, [indice, banners]);

  return (
    <section style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        {banners.length > 0 ? (
          banners.map((banner, i) => {
            const url = urlCompleta(banner.imagem_url);
            const estiloCamada = {
              position: 'absolute', inset: 0,
              opacity: i === indice ? 1 : 0,
              transition: 'opacity 1.2s ease',
            };
            return ehVideo(banner.imagem_url) ? (
              <video
                key={banner.id}
                ref={(el) => { videoRefs.current[i] = el; }}
                src={url}
                muted playsInline
                onEnded={i === indice ? aoAvancar : undefined}
                style={{ ...estiloCamada, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div key={banner.id} style={{ ...estiloCamada, background: `url(${url}) center/cover` }} />
            );
          })
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'var(--fundo)' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.55) 32%, rgba(255,255,255,0) 70%)' }} />
      </div>

      <div className="container" style={{ position: 'relative', minHeight: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4rem 20px' }}>
        <div style={{ maxWidth: 560 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 20, border: '1px solid var(--borda)', background: '#fff', padding: '7px 16px', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--cor-primaria)' }}>
            <HomeIcon size={14} /> CRECI 5581J
          </span>
          <h1 style={{ fontSize: 'clamp(30px, 4.5vw, 44px)', fontWeight: 800, lineHeight: 1.15, margin: '18px 0 0' }}>
            {linha1}{linha2 ? <><br /><span style={{ color: 'var(--cor-primaria)' }}>{linha2}</span></> : null}
          </h1>
          <p style={{ fontSize: 16, color: 'black', lineHeight: 1.6, margin: '16px 0 0', maxWidth: 460 }}>
            {config.hero_subtitulo}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 28 }}>
            <Link to="/catalogo" className="btn-primario" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontSize: 15, padding: '12px 24px' }}>
              Ver catálogo <ChevronRight size={16} />
            </Link>
            <Link to="/contatos" className="btn-secundario" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', fontSize: 15, padding: '12px 24px', background: '#fff' }}>
              Falar com corretor
            </Link>
          </div>
        </div>
      </div>

      {banners.length > 1 && (
        <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
          {banners.map((b, i) => (
            <span key={b.id} style={{ width: 7, height: 7, borderRadius: '50%', background: i === indice ? 'var(--cor-primaria)' : 'var(--borda)', transition: 'background 0.3s ease' }} />
          ))}
        </div>
      )}
    </section>
  );
}

function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="container" style={{ maxWidth: 620, textAlign: 'center', padding: '0 20px' }}>
      <span className="badge-eyebrow">{eyebrow}</span>
      <h2 style={{ fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 800, margin: '8px 0 0' }}>{title}</h2>
      <p style={{ fontSize: 15, color: 'var(--texto-secundario)', margin: '10px 0 0' }}>{subtitle}</p>
    </div>
  );
}

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [indice, setIndice] = useState(0);
  const [destaques, setDestaques] = useState([]);
  const [config, setConfig] = useState({
    hero_titulo: 'Encontre o lar||que você merece',
    hero_subtitulo: 'Imóveis selecionados, atendimento personalizado e as melhores oportunidades do mercado.',
  });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get('/banners/publico'),
      api.get('/imoveis/publico/destaques'),
      api.get('/config/publico'),
    ]).then(([resBanners, resDestaques, resConfig]) => {
      if (resBanners.status === 'fulfilled') setBanners(resBanners.value.data);
      if (resDestaques.status === 'fulfilled') setDestaques(resDestaques.value.data);
      if (resConfig.status === 'fulfilled') setConfig(resConfig.value.data);
      setCarregando(false);

      [resBanners, resDestaques, resConfig].forEach((r) => {
        if (r.status === 'rejected') console.error('Falha ao carregar dado da home:', r.reason);
      });
    });
  }, []);

  // Avança pro próximo banner. Chamado com 5s de intervalo quando o banner atual é
  // foto, ou quando o vídeo termina de tocar (ver dentro do componente Hero).
  // useCallback evita recriar essa função a cada render, o que reiniciaria o timer à toa.
  const avancarBanner = useCallback(() => {
    setIndice((i) => (banners.length ? (i + 1) % banners.length : 0));
  }, [banners.length]);

  return (
    <div>
      <Hero banners={banners} indice={indice} aoAvancar={avancarBanner} config={config} />

      <section id="destaques" style={{ padding: '5rem 0' }}>
        <SectionHeader eyebrow="Destaques" title="Imóveis em destaque" subtitle="As melhores oportunidades selecionadas especialmente para você." />
        <div className="container" style={{ padding: '0 20px' }}>
          {carregando ? (
            <p style={{ color: 'var(--texto-secundario)', textAlign: 'center', marginTop: 48 }}>Carregando...</p>
          ) : destaques.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: 48, padding: '3rem', border: '1px dashed var(--borda)', borderRadius: 16 }}>
              <Building2 size={32} color="var(--texto-secundario)" style={{ margin: '0 auto' }} />
              <p style={{ color: 'var(--texto-secundario)', marginTop: 14 }}>Nenhum imóvel em destaque no momento.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginTop: 48 }}>
              {destaques.map((imovel) => (
                <ImovelCard key={imovel.id} imovel={imovel} tag="Destaque" />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
