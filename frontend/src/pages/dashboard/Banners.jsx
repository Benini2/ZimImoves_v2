import { useEffect, useRef, useState } from 'react';
import { Trash2, ImageOff, Upload, Type, Video } from 'lucide-react';
import api, { ARQUIVOS_URL } from '../../api';
import RecorteImagemModal from '../../components/RecorteImagemModal';

function urlCompleta(caminho) {
  if (!caminho) return null;
  return caminho.startsWith('http') ? caminho : `${ARQUIVOS_URL}${caminho}`;
}

// Decide se uma URL é vídeo só pela extensão do arquivo (não criamos coluna nova no banco pra isso)
function ehVideo(url) {
  return /\.(mp4|webm)$/i.test(url || '');
}

export default function Banners() {
  const inputRef = useRef(null);
  const [banners, setBanners] = useState([]);
  const [arquivoParaRecorte, setArquivoParaRecorte] = useState(null);
  const [novaMidia, setNovaMidia] = useState(''); // pode ser imagem ou vídeo
  const [novoLink, setNovoLink] = useState('');
  const [erro, setErro] = useState('');
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [linha1, setLinha1] = useState('');
  const [linha2, setLinha2] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [salvandoTextos, setSalvandoTextos] = useState(false);
  const [textosSalvos, setTextosSalvos] = useState(false);

  async function carregar() {
    const { data } = await api.get('/banners');
    setBanners(data);
  }

  async function carregarTextos() {
    const { data } = await api.get('/config');
    const [l1, l2] = (data.hero_titulo || '').split('||');
    setLinha1(l1 || '');
    setLinha2(l2 || '');
    setSubtitulo(data.hero_subtitulo || '');
  }

  useEffect(() => { carregar(); carregarTextos(); }, []);

  async function salvarTextos() {
    setSalvandoTextos(true);
    setTextosSalvos(false);
    try {
      await api.put('/config', { hero_titulo: `${linha1}||${linha2}`, hero_subtitulo: subtitulo });
      setTextosSalvos(true);
      setTimeout(() => setTextosSalvos(false), 2500);
    } finally {
      setSalvandoTextos(false);
    }
  }

  const ativos = banners.filter((b) => b.ativo).length;

  function aoEscolherArquivo(e) {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo) return;

    if (arquivo.type.startsWith('video/')) {
      enviarVideo(arquivo);
    } else {
      // Imagem passa pela tela de recorte antes de subir
      setArquivoParaRecorte(arquivo);
    }
  }

  async function enviarVideo(arquivo) {
    setErro('');
    setEnviandoImagem(true);
    try {
      const formData = new FormData();
      formData.append('arquivo', arquivo);
      const { data } = await api.post('/upload/banner', formData);
      setNovaMidia(data.url);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Não foi possível enviar o vídeo.');
    } finally {
      setEnviandoImagem(false);
    }
  }

  async function aoConfirmarRecorte(blob) {
    setArquivoParaRecorte(null);
    setEnviandoImagem(true);
    setErro('');
    try {
      const formData = new FormData();
      formData.append('imagem', blob, 'banner.jpg');
      const { data } = await api.post('/upload', formData);
      setNovaMidia(data.url);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Não foi possível enviar a imagem.');
    } finally {
      setEnviandoImagem(false);
    }
  }

  async function adicionar() {
    if (!novaMidia) {
      setErro('Envie uma imagem ou vídeo antes de adicionar o banner.');
      return;
    }
    setErro('');
    setSalvando(true);
    try {
      await api.post('/banners', { imagemUrl: novaMidia, linkUrl: novoLink, ordem: banners.length });
      setNovaMidia('');
      setNovoLink('');
      carregar();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Não foi possível adicionar o banner.');
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id) {
    if (!confirm('Excluir este banner?')) return;
    await api.delete(`/banners/${id}`);
    carregar();
  }

  async function alternarAtivo(banner) {
    if (!banner.ativo && ativos >= 3) {
      setErro('Só é permitido ter 3 banners ativos ao mesmo tempo. Desative um antes de ativar outro.');
      return;
    }
    setErro('');
    await api.put(`/banners/${banner.id}`, { ...banner, ativo: !banner.ativo, imagemUrl: banner.imagem_url, linkUrl: banner.link_url });
    carregar();
  }

  const previewNovaMidia = urlCompleta(novaMidia);
  const novaMidiaEhVideo = ehVideo(novaMidia);

  return (
    <div style={{ maxWidth: 700 }}>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>Banners da vitrine</h1>
      <p style={{ fontSize: 13, color: 'var(--texto-secundario)', marginBottom: 24 }}>
        Até 3 banners ativos aparecem no carrossel da página inicial ({ativos}/3 ativos). Pode ser foto ou um vídeo curto (mudo, em loop).
      </p>

      <div style={{ background: '#fff', border: '1px solid var(--borda)', borderRadius: 12, padding: '1.25rem', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Type size={15} color="var(--texto-secundario)" />
          <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--texto-secundario)', margin: 0 }}>TÍTULO E SUBTÍTULO DA HOME</p>
        </div>
        <p style={{ fontSize: 12, color: 'var(--texto-secundario)', marginBottom: 12 }}>
          É o texto que aparece em cima do banner principal, ao lado do botão "Ver catálogo".
        </p>
        <div className="grid-2" style={{ marginBottom: 10 }}>
          <input placeholder="Primeira linha do título" value={linha1} onChange={(e) => setLinha1(e.target.value)} />
          <input placeholder="Segunda linha (fica em vermelho)" value={linha2} onChange={(e) => setLinha2(e.target.value)} />
        </div>
        <textarea
          placeholder="Subtítulo"
          rows={2}
          style={{ width: '100%', resize: 'vertical' }}
          value={subtitulo}
          onChange={(e) => setSubtitulo(e.target.value)}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
          <button onClick={salvarTextos} className="btn-primario" disabled={salvandoTextos}>
            {salvandoTextos ? 'Salvando...' : 'Salvar textos'}
          </button>
          {textosSalvos && <span style={{ fontSize: 12, color: '#1f9d55' }}>Salvo!</span>}
        </div>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--borda)', borderRadius: 12, padding: '1.25rem', marginBottom: 24 }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--texto-secundario)', marginBottom: 10 }}>NOVO BANNER</p>

        <div
          onClick={() => inputRef.current?.click()}
          style={{
            position: 'relative', aspectRatio: '2.7', borderRadius: 12, border: '1px dashed var(--borda)',
            background: previewNovaMidia && !novaMidiaEhVideo ? `url(${previewNovaMidia}) center/cover` : 'var(--fundo)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
            cursor: 'pointer', overflow: 'hidden',
          }}
        >
          {previewNovaMidia && novaMidiaEhVideo && (
            <video src={previewNovaMidia} autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          )}
          {!previewNovaMidia && !enviandoImagem && (
            <>
              <Upload size={22} color="var(--texto-secundario)" />
              <span style={{ fontSize: 13, color: 'var(--texto-secundario)' }}>Clique para escolher foto ou vídeo</span>
              <span style={{ fontSize: 11, color: '#a6a49c' }}>Fotos passam por um ajuste de recorte em seguida</span>
            </>
          )}
          {enviandoImagem && (
            <span style={{ fontSize: 12, color: 'var(--texto-secundario)', background: '#fff', padding: '4px 10px', borderRadius: 6, zIndex: 1 }}>Enviando...</span>
          )}
          {previewNovaMidia && !enviandoImagem && (
            <span style={{ position: 'absolute', bottom: 8, right: 8, fontSize: 11, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '3px 8px', borderRadius: 6, zIndex: 1 }}>
              Trocar {novaMidiaEhVideo ? 'vídeo' : 'imagem'}
            </span>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,video/mp4,video/webm" onChange={aoEscolherArquivo} style={{ display: 'none' }} />

        <input
          placeholder="Link ao clicar no banner (opcional)"
          value={novoLink}
          onChange={(e) => setNovoLink(e.target.value)}
          style={{ width: '100%', marginTop: 12 }}
        />
        {erro && <p className="erro" style={{ marginTop: 10 }}>{erro}</p>}
        <button
          onClick={adicionar}
          className="btn-primario"
          disabled={salvando || enviandoImagem || ativos >= 3}
          style={{ marginTop: 12 }}
        >
          {salvando ? 'Adicionando...' : 'Adicionar banner'}
        </button>
        {ativos >= 3 && (
          <p style={{ fontSize: 12, color: 'var(--texto-secundario)', marginTop: 8 }}>
            Você já tem 3 banners ativos. Desative um abaixo para poder adicionar outro.
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {banners.map((banner) => {
          const midia = urlCompleta(banner.imagem_url);
          const video = ehVideo(banner.imagem_url);
          return (
            <div key={banner.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid var(--borda)', borderRadius: 10, padding: 10 }}>
              {midia ? (
                video ? (
                  <video src={midia} autoPlay muted loop playsInline style={{ width: 90, height: 52, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 90, height: 52, borderRadius: 6, background: `url(${midia}) center/cover`, flexShrink: 0 }} />
                )
              ) : (
                <div style={{ width: 90, height: 52, borderRadius: 6, background: 'var(--fundo)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ImageOff size={16} color="var(--texto-secundario)" />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, margin: 0, display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {video && <Video size={13} color="var(--texto-secundario)" />}
                  {banner.link_url || 'Sem link ao clicar'}
                </p>
                <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 12, background: banner.ativo ? '#e3f7ea' : 'var(--fundo)', color: banner.ativo ? '#1f9d55' : 'var(--texto-secundario)' }}>
                  {banner.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <button className="btn-secundario" onClick={() => alternarAtivo(banner)}>{banner.ativo ? 'Desativar' : 'Ativar'}</button>
              <button onClick={() => excluir(banner.id)} style={{ background: 'none', border: 'none', color: 'var(--cor-primaria)', display: 'flex', padding: 6 }} title="Excluir">
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
        {banners.length === 0 && (
          <p style={{ color: 'var(--texto-secundario)', fontSize: 13, textAlign: 'center', padding: '1.5rem 0' }}>Nenhum banner cadastrado ainda.</p>
        )}
      </div>

      {arquivoParaRecorte && (
        <RecorteImagemModal
          arquivo={arquivoParaRecorte}
          onConfirmar={aoConfirmarRecorte}
          onCancelar={() => setArquivoParaRecorte(null)}
        />
      )}
    </div>
  );
}
