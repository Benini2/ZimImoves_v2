import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Car, Square, ChevronRight, ImageOff } from 'lucide-react';
import { ARQUIVOS_URL } from '../api';

const TIPO_LABEL = {
  apartamento: 'Apartamento',
  casa: 'Casa',
  terreno: 'Terreno',
  sala_comercial: 'Sala comercial',
};

function urlCapa(foto) {
  if (!foto) return null;
  return foto.startsWith('http') ? foto : `${ARQUIVOS_URL}${foto}`;
}

export default function ImovelCard({ imovel, tag }) {
  const capa = urlCapa(imovel.foto_capa);
  const preco = Number(imovel.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const localizacao = [imovel.bairro, imovel.cidade].filter(Boolean).join(', ');

  return (
    <article className="card-imovel">
      <Link to={`/imovel/${imovel.id}`} className="card-imovel-foto">
        {capa ? (
          <div className="imagem-fundo" style={{ background: `url(${capa}) center/cover` }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ImageOff size={24} color="var(--texto-secundario)" />
          </div>
        )}
        {tag && (
          <span style={{ position: 'absolute', top: 12, left: 12, background: 'var(--cor-primaria)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 7 }}>
            {tag}
          </span>
        )}
      </Link>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '1.1rem' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
          <Link to={`/imovel/${imovel.id}`} style={{ color: 'var(--texto)' }}>{imovel.nome}</Link>
        </h3>
        <p style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--texto-secundario)', margin: '6px 0 0' }}>
          <MapPin size={13} />
          {localizacao || TIPO_LABEL[imovel.tipo]}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'var(--texto-secundario)', marginTop: 14 }}>
          {imovel.quartos ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><BedDouble size={15} />{imovel.quartos}</span>
          ) : null}
          {imovel.vagas ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Car size={15} />{imovel.vagas}</span>
          ) : null}
          {imovel.area_terreno ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Square size={15} />{imovel.area_terreno}m²</span>
          ) : null}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--borda)', marginTop: 18, paddingTop: 14 }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--cor-primaria)' }}>{preco}</span>
          <Link to={`/imovel/${imovel.id}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: 'var(--texto)' }}>
            Detalhes <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
