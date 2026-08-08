import { useEffect, useRef, useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

// Proporção de saída do banner (largura : altura). 2.7:1 combina com o hero da home.
const PROPORCAO = 2.7;
const SAIDA_LARGURA = 2400;
const SAIDA_ALTURA = Math.round(SAIDA_LARGURA / PROPORCAO);

export default function RecorteImagemModal({ arquivo, onConfirmar, onCancelar }) {
  const imgRef = useRef(null);
  const areaRef = useRef(null);
  const arrastando = useRef(false);
  const inicio = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const [urlImagem, setUrlImagem] = useState(null);
  const [pronto, setPronto] = useState(false);
  const [escalaBase, setEscalaBase] = useState(1);
  const [zoom, setZoom] = useState(1); // multiplicador sobre a escala base (cover)
  const [pos, setPos] = useState({ x: 0, y: 0 }); // top-left da imagem, em px, relativo à área visível
  const [areaTam, setAreaTam] = useState({ w: 0, h: 0 });
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(arquivo);
    setUrlImagem(url);
    return () => URL.revokeObjectURL(url);
  }, [arquivo]);

  useEffect(() => {
    if (areaRef.current) {
      const rect = areaRef.current.getBoundingClientRect();
      setAreaTam({ w: rect.width, h: rect.height });
    }
  }, [urlImagem]);

  function aoCarregarImagem() {
    const img = imgRef.current;
    const area = areaRef.current;
    if (!img || !area) return;
    const rect = area.getBoundingClientRect();
    const base = Math.max(rect.width / img.naturalWidth, rect.height / img.naturalHeight);
    setEscalaBase(base);
    setAreaTam({ w: rect.width, h: rect.height });
    // Centraliza a imagem na área visível
    const larguraImg = img.naturalWidth * base;
    const alturaImg = img.naturalHeight * base;
    setPos({ x: (rect.width - larguraImg) / 2, y: (rect.height - alturaImg) / 2 });
    setPronto(true);
  }

  function limitarPos(x, y, escalaAtual) {
    const img = imgRef.current;
    const larguraImg = img.naturalWidth * escalaAtual;
    const alturaImg = img.naturalHeight * escalaAtual;
    const minX = Math.min(0, areaTam.w - larguraImg);
    const minY = Math.min(0, areaTam.h - alturaImg);
    return { x: Math.min(0, Math.max(minX, x)), y: Math.min(0, Math.max(minY, y)) };
  }

  function aoIniciarArraste(e) {
    arrastando.current = true;
    const ponto = e.touches ? e.touches[0] : e;
    inicio.current = { x: ponto.clientX, y: ponto.clientY, tx: pos.x, ty: pos.y };
  }

  function aoMover(e) {
    if (!arrastando.current) return;
    const ponto = e.touches ? e.touches[0] : e;
    const dx = ponto.clientX - inicio.current.x;
    const dy = ponto.clientY - inicio.current.y;
    const escalaAtual = escalaBase * zoom;
    setPos(limitarPos(inicio.current.tx + dx, inicio.current.ty + dy, escalaAtual));
  }

  function aoSoltar() {
    arrastando.current = false;
  }

  function aoMudarZoom(novoZoom) {
    const img = imgRef.current;
    if (!img) return;
    const escalaAntiga = escalaBase * zoom;
    const escalaNova = escalaBase * novoZoom;
    // Mantém o centro da área fixo enquanto aplica o zoom
    const cx = areaTam.w / 2;
    const cy = areaTam.h / 2;
    const fatorX = (cx - pos.x) / escalaAntiga;
    const fatorY = (cy - pos.y) / escalaAntiga;
    const novoX = cx - fatorX * escalaNova;
    const novoY = cy - fatorY * escalaNova;
    setZoom(novoZoom);
    setPos(limitarPos(novoX, novoY, escalaNova));
  }

  async function confirmar() {
    const img = imgRef.current;
    if (!img) return;
    setProcessando(true);

    const k = SAIDA_LARGURA / areaTam.w;
    const escalaFinal = escalaBase * zoom * k;
    const destX = pos.x * k;
    const destY = pos.y * k;

    const canvas = document.createElement('canvas');
    canvas.width = SAIDA_LARGURA;
    canvas.height = SAIDA_ALTURA;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, destX, destY, img.naturalWidth * escalaFinal, img.naturalHeight * escalaFinal);

    canvas.toBlob((blob) => {
      setProcessando(false);
      onConfirmar(blob);
    }, 'image/jpeg', 0.95);
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,15,15,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 640 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Ajustar imagem do banner</p>
          <button onClick={onCancelar} style={{ background: 'transparent', border: 'none', color: 'var(--texto-secundario)', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        <div
          ref={areaRef}
          onMouseDown={aoIniciarArraste}
          onMouseMove={aoMover}
          onMouseUp={aoSoltar}
          onMouseLeave={aoSoltar}
          onTouchStart={aoIniciarArraste}
          onTouchMove={aoMover}
          onTouchEnd={aoSoltar}
          style={{
            position: 'relative', width: '100%', aspectRatio: `${PROPORCAO}`, overflow: 'hidden',
            borderRadius: 10, background: 'var(--fundo)', cursor: 'grab', userSelect: 'none',
          }}
        >
          {urlImagem && (
            <img
              ref={imgRef}
              src={urlImagem}
              onLoad={aoCarregarImagem}
              draggable={false}
              alt=""
              style={{
                position: 'absolute',
                left: pos.x, top: pos.y,
                width: pronto ? imgRef.current.naturalWidth * escalaBase * zoom : 'auto',
                height: pronto ? imgRef.current.naturalHeight * escalaBase * zoom : 'auto',
                maxWidth: 'none',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>

        <p style={{ fontSize: 12, color: 'var(--texto-secundario)', margin: '10px 0 0' }}>Arraste a imagem para posicionar.</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
          <ZoomIn size={16} color="var(--texto-secundario)" />
          <input
            type="range" min={1} max={3} step={0.01}
            value={zoom}
            onChange={(e) => aoMudarZoom(Number(e.target.value))}
            style={{ flex: 1 }}
            disabled={!pronto}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
          <button onClick={onCancelar} className="btn-secundario">Cancelar</button>
          <button onClick={confirmar} className="btn-primario" disabled={!pronto || processando}>
            {processando ? 'Enviando...' : 'Usar essa imagem'}
          </button>
        </div>
      </div>
    </div>
  );
}
