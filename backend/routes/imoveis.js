import { Router } from 'express';
import { pool } from '../db.js';
import { autenticar } from '../middleware/auth.js';

const router = Router();

// Colunas seguras para expor na vitrine pública.
// proprietario_nome, proprietario_contato e observacoes ficam de fora de propósito.
const COLUNAS_PUBLICAS = `
  id, nome, preco, tipo, status, cidade, estado, bairro, quartos, suites, vagas,
  area_terreno, area_construida, descricao, foto_capa, comodidades, destaque,
  criado_em, atualizado_em
`;

function parseImovel(row) {
  let comodidades = [];
  if (row.comodidades) {
    if (Array.isArray(row.comodidades)) {
      // mysql2 já pode devolver JSON decodificado, dependendo da versão/driver
      comodidades = row.comodidades;
    } else {
      try {
        comodidades = JSON.parse(row.comodidades);
      } catch {
        // Registro antigo/mal formatado (ex: "Elevador,Sacada,aaaa" sem ser JSON válido)
        comodidades = String(row.comodidades)
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean);
      }
    }
  }
  return { ...row, comodidades };
}

/* ---------- ROTAS PÚBLICAS (vitrine do cliente) ---------- */

// GET /api/imoveis/publico/destaques — até 3 imóveis marcados como destaque e postados
router.get('/publico/destaques', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT ${COLUNAS_PUBLICAS} FROM imoveis WHERE status = 'postado' AND destaque = 1 ORDER BY atualizado_em DESC LIMIT 3`
  );
  res.json(rows.map(parseImovel));
});

// GET /api/imoveis/publico — catálogo com filtros, só imóveis postados
router.get('/publico', async (req, res) => {
  const { tipo, bairro, precoMin, precoMax } = req.query;
  const condicoes = [`status = 'postado'`];
  const valores = [];

  if (tipo) {
    condicoes.push('tipo = ?');
    valores.push(tipo);
  }
  if (bairro) {
    condicoes.push('bairro LIKE ?');
    valores.push(`%${bairro}%`);
  }
  if (precoMin) {
    condicoes.push('preco >= ?');
    valores.push(precoMin);
  }
  if (precoMax) {
    condicoes.push('preco <= ?');
    valores.push(precoMax);
  }

  const [rows] = await pool.query(
    `SELECT ${COLUNAS_PUBLICAS} FROM imoveis WHERE ${condicoes.join(' AND ')} ORDER BY destaque DESC, criado_em DESC`,
    valores
  );
  res.json(rows.map(parseImovel));
});

// GET /api/imoveis/publico/:id — detalhe de um imóvel postado + fotos da galeria
router.get('/publico/:id', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT ${COLUNAS_PUBLICAS} FROM imoveis WHERE id = ? AND status = 'postado' LIMIT 1`,
    [req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ erro: 'Imóvel não encontrado.' });

  const [fotos] = await pool.query(
    'SELECT id, url FROM imovel_fotos WHERE imovel_id = ? ORDER BY ordem',
    [req.params.id]
  );

  res.json({ ...parseImovel(rows[0]), fotos });
});

/* ---------- ROTAS PRIVADAS (dashboard, exigem login) ---------- */
router.use(autenticar);

// GET /api/imoveis — lista completa com filtros (status, tipo, cidade, bairro, preço min/max)
router.get('/', async (req, res) => {
  const { status, tipo, cidade, bairro, precoMin, precoMax } = req.query;
  const condicoes = ['1=1'];
  const valores = [];

  if (status) {
    condicoes.push('status = ?');
    valores.push(status);
  }
  if (tipo) {
    condicoes.push('tipo = ?');
    valores.push(tipo);
  }
  if (cidade) {
    condicoes.push('cidade = ?');
    valores.push(cidade);
  }
  if (bairro) {
    condicoes.push('bairro LIKE ?');
    valores.push(`%${bairro}%`);
  }
  if (precoMin) {
    condicoes.push('preco >= ?');
    valores.push(precoMin);
  }
  if (precoMax) {
    condicoes.push('preco <= ?');
    valores.push(precoMax);
  }

  const [rows] = await pool.query(
    `SELECT * FROM imoveis WHERE ${condicoes.join(' AND ')} ORDER BY destaque DESC, criado_em DESC`,
    valores
  );
  res.json(rows.map(parseImovel));
});

// GET /api/imoveis/cidades — só as cidades que têm pelo menos 1 imóvel cadastrado, pro filtro
router.get('/cidades', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT cidade, COUNT(*) total FROM imoveis
     WHERE cidade IS NOT NULL AND cidade <> ''
     GROUP BY cidade ORDER BY cidade ASC`
  );
  res.json(rows);
});

// GET /api/imoveis/resumo — contadores para os cards do topo do dashboard
router.get('/resumo', async (req, res) => {
  const [[{ total }]] = await pool.query('SELECT COUNT(*) total FROM imoveis');
  const [[{ postados }]] = await pool.query(`SELECT COUNT(*) postados FROM imoveis WHERE status='postado'`);
  const [[{ naoPostados }]] = await pool.query(`SELECT COUNT(*) naoPostados FROM imoveis WHERE status='nao_postado'`);
  const [[{ vendidos }]] = await pool.query(`SELECT COUNT(*) vendidos FROM imoveis WHERE status='vendido'`);
  res.json({ total, postados, naoPostados, vendidos });
});

// GET /api/imoveis/:id
router.get('/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM imoveis WHERE id = ?', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ erro: 'Imóvel não encontrado.' });
  const [fotos] = await pool.query(
    'SELECT id, url FROM imovel_fotos WHERE imovel_id = ? ORDER BY ordem',
    [req.params.id]
  );
  res.json({ ...parseImovel(rows[0]), fotos });
});

// POST /api/imoveis — cadastrar
router.post('/', async (req, res) => {
  const {
    nome, preco, tipo, status = 'nao_postado', cidade, estado, bairro,
    quartos, suites, vagas, areaTerreno, areaConstruida,
    descricao, fotoCapa, comodidades = [], destaque = false, fotos = [],
    proprietarioNome, proprietarioContato, observacoes,
  } = req.body;

  if (!nome || !preco || !tipo) {
    return res.status(400).json({ erro: 'Nome, preço e tipo são obrigatórios.' });
  }

  const [result] = await pool.query(
    `INSERT INTO imoveis
      (nome, preco, tipo, status, cidade, estado, bairro, quartos, suites, vagas,
       area_terreno, area_construida, descricao, foto_capa, comodidades, destaque,
       proprietario_nome, proprietario_contato, observacoes)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [nome, preco, tipo, status, cidade, estado, bairro, quartos, suites, vagas,
     areaTerreno, areaConstruida, descricao, fotoCapa, JSON.stringify(comodidades), destaque ? 1 : 0,
     proprietarioNome, proprietarioContato, observacoes]
  );

  if (fotos.length > 0) {
    const valores = fotos.map((url, i) => [result.insertId, url, i]);
    await pool.query('INSERT INTO imovel_fotos (imovel_id, url, ordem) VALUES ?', [valores]);
  }

  res.status(201).json({ id: result.insertId });
});

// PUT /api/imoveis/:id — editar
router.put('/:id', async (req, res) => {
  const {
    nome, preco, tipo, status, cidade, estado, bairro,
    quartos, suites, vagas, areaTerreno, areaConstruida,
    descricao, fotoCapa, comodidades = [], destaque = false, fotos = [],
    proprietarioNome, proprietarioContato, observacoes,
  } = req.body;

  const [result] = await pool.query(
    `UPDATE imoveis SET
      nome=?, preco=?, tipo=?, status=?, cidade=?, estado=?, bairro=?, quartos=?, suites=?,
      vagas=?, area_terreno=?, area_construida=?, descricao=?, foto_capa=?, comodidades=?, destaque=?,
      proprietario_nome=?, proprietario_contato=?, observacoes=?
     WHERE id=?`,
    [nome, preco, tipo, status, cidade, estado, bairro, quartos, suites, vagas,
     areaTerreno, areaConstruida, descricao, fotoCapa, JSON.stringify(comodidades), destaque ? 1 : 0,
     proprietarioNome, proprietarioContato, observacoes,
     req.params.id]
  );

  if (result.affectedRows === 0) return res.status(404).json({ erro: 'Imóvel não encontrado.' });

  // Substitui a galeria pela lista atual enviada do formulário
  await pool.query('DELETE FROM imovel_fotos WHERE imovel_id = ?', [req.params.id]);
  if (fotos.length > 0) {
    const valores = fotos.map((url, i) => [req.params.id, url, i]);
    await pool.query('INSERT INTO imovel_fotos (imovel_id, url, ordem) VALUES ?', [valores]);
  }

  res.json({ ok: true });
});

// PATCH /api/imoveis/:id/destaque — liga/desliga o destaque direto na listagem
router.patch('/:id/destaque', async (req, res) => {
  const { destaque } = req.body;
  await pool.query('UPDATE imoveis SET destaque=? WHERE id=?', [destaque ? 1 : 0, req.params.id]);
  res.json({ ok: true });
});

// PATCH /api/imoveis/:id/status — atalho para postar/despostar/marcar vendido
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['postado', 'nao_postado', 'vendido'].includes(status)) {
    return res.status(400).json({ erro: 'Status inválido.' });
  }
  await pool.query('UPDATE imoveis SET status=? WHERE id=?', [status, req.params.id]);
  res.json({ ok: true });
});

// DELETE /api/imoveis/:id
router.delete('/:id', async (req, res) => {
  const [result] = await pool.query('DELETE FROM imoveis WHERE id=?', [req.params.id]);
  if (result.affectedRows === 0) return res.status(404).json({ erro: 'Imóvel não encontrado.' });
  res.json({ ok: true });
});

export default router;
