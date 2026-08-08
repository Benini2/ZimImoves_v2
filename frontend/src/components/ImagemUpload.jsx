import { useRef, useState } from 'react';
import api, { ARQUIVOS_URL } from '../api';

export default function ImagemUpload({ value, onChange, altura = 140 }) {
  const inputRef = useRef(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  async function aoSelecionar(e) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    setErro('');
    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append('imagem', arquivo);
      const { data } = await api.post('/upload', formData);
      onChange(data.url);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Não foi possível enviar a imagem.');
    } finally {
      setEnviando(false);
      e.target.value = '';
    }
  }

  const urlPreview = value ? (value.startsWith('http') ? value : `${ARQUIVOS_URL}${value}`) : null;

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          height: altura,
          borderRadius: 12,
          border: '1px dashed var(--borda)',
          background: urlPreview ? `url(${urlPreview}) center/cover no-repeat` : 'var(--superficie)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {!urlPreview && !enviando && (
          <>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9b9a94" strokeWidth="1.6">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="9" cy="10" r="1.6" />
              <path d="M21 15l-5-5-9 9" />
            </svg>
            <span style={{ fontSize: 13, color: 'var(--texto-secundario)' }}>Foto de capa</span>
            <span style={{ fontSize: 11, color: '#a6a49c' }}>Clique para adicionar</span>
          </>
        )}
        {enviando && <span style={{ fontSize: 12, color: 'var(--texto-secundario)', background: '#fff', padding: '4px 10px', borderRadius: 6 }}>Enviando...</span>}
        {urlPreview && !enviando && (
          <span style={{ position: 'absolute', bottom: 8, right: 8, fontSize: 11, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '3px 8px', borderRadius: 6 }}>
            Trocar imagem
          </span>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={aoSelecionar} style={{ display: 'none' }} />
      {erro && <p className="erro" style={{ marginTop: 6 }}>{erro}</p>}
    </div>
  );
}