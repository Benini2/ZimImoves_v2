import { useRef, useState } from 'react';
import api, { ARQUIVOS_URL } from '../api';

// Grade de fotos adicionais: mostra as já enviadas + um quadrado "+" para adicionar mais.
export default function GaleriaUpload({ value = [], onChange }) {
  const inputRef = useRef(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  async function aoSelecionar(e) {
    const arquivos = Array.from(e.target.files || []);
    if (arquivos.length === 0) return;

    setErro('');
    setEnviando(true);
    try {
      const formData = new FormData();
      arquivos.forEach((arquivo) => formData.append('imagens', arquivo));
      const { data } = await api.post('/upload/multiplas', formData);
      onChange([...value, ...data.urls]);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Não foi possível enviar as imagens.');
    } finally {
      setEnviando(false);
      e.target.value = '';
    }
  }

  function remover(url) {
    onChange(value.filter((u) => u !== url));
  }

  function urlCompleta(url) {
    return url.startsWith('http') ? url : `${ARQUIVOS_URL}${url}`;
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 8 }}>
        {value.map((url) => (
          <div key={url} style={{ position: 'relative', height: 80, borderRadius: 8, overflow: 'hidden', background: `url(${urlCompleta(url)}) center/cover` }}>
            <button
              type="button"
              onClick={() => remover(url)}
              style={{
                position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%',
                border: 'none', background: 'rgba(0,0,0,0.65)', color: '#fff', fontSize: 12, lineHeight: 1, padding: 0,
              }}
            >
              ×
            </button>
          </div>
        ))}

        <div
          onClick={() => inputRef.current?.click()}
          style={{
            height: 80, borderRadius: 8, border: '1px dashed var(--borda)', background: 'var(--superficie)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          {enviando ? (
            <span style={{ fontSize: 11, color: 'var(--texto-secundario)' }}>Enviando...</span>
          ) : (
            <span style={{ fontSize: 22, color: 'var(--texto-secundario)' }}>+</span>
          )}
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={aoSelecionar} style={{ display: 'none' }} />
      {erro && <p className="erro" style={{ marginTop: 6 }}>{erro}</p>}
    </div>
  );
}
