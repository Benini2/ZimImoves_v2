import { pool } from '../db.js';

// Deixa o texto seguro para ir dentro de atributos HTML (evita quebrar a página com aspas etc.)
function escaparHtml(texto = '') {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function paginaDePreViaDoImovel(req, res) {
  const { id } = req.params;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const urlDoImovel = `${frontendUrl}/imovel/${id}`;

  const [rows] = await pool.query(
    `SELECT nome, preco, tipo, cidade, bairro, foto_capa FROM imoveis WHERE id = ? AND status = 'postado' LIMIT 1`,
    [id]
  );
  const imovel = rows[0];

  // Imóvel não existe (foi vendido/removido) — manda o robô pra home mesmo assim
  if (!imovel) {
    return res.redirect(frontendUrl);
  }

  const preco = Number(imovel.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const local = [imovel.bairro, imovel.cidade].filter(Boolean).join(', ');
  const titulo = `${imovel.nome} — ${preco}`;
  const descricao = `${local ? local + ' · ' : ''}Confira esse imóvel na Zim Imóveis.`;

  // A imagem precisa ser uma URL absoluta; monta a partir do próprio host que respondeu essa requisição
  const baseImagem = `${req.protocol}://${req.get('host')}`;
  const imagem = imovel.foto_capa
    ? (imovel.foto_capa.startsWith('http') ? imovel.foto_capa : `${baseImagem}${imovel.foto_capa}`)
    : `${frontendUrl}/images/logo-icone.svg`;

  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>${escaparHtml(titulo)}</title>
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escaparHtml(titulo)}" />
  <meta property="og:description" content="${escaparHtml(descricao)}" />
  <meta property="og:image" content="${escaparHtml(imagem)}" />
  <meta property="og:url" content="${escaparHtml(urlDoImovel)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escaparHtml(titulo)}" />
  <meta name="twitter:description" content="${escaparHtml(descricao)}" />
  <meta name="twitter:image" content="${escaparHtml(imagem)}" />
  <meta http-equiv="refresh" content="0; url=${escaparHtml(urlDoImovel)}" />
</head>
<body>
  <p>Redirecionando... <a href="${escaparHtml(urlDoImovel)}">clique aqui</a> se não for automático.</p>
</body>
</html>`);
}
