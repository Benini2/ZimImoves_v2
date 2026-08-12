import { Router } from 'express';
import { pool } from '../db.js';
import { autenticar, permitir } from '../middleware/auth.js';

const router = Router();

// GET /api/banners/publico — banners ativos, na ordem, para o carrossel da vitrine
router.get('/publico', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, imagem_url, link_url FROM banners WHERE ativo = 1 ORDER BY ordem LIMIT 3'
  );
  res.json(rows);
});

router.use(autenticar);

// GET /api/banners — todos, para a tela de configuração no dashboard
router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM banners ORDER BY ordem');
  res.json(rows);
});

// POST /api/banners — cadastra um banner (máximo 3 ativos)
router.post('/', permitir('master', 'corretor'), async (req, res) => {
  const { imagemUrl, linkUrl, ordem = 0 } = req.body;
  const [[{ ativos }]] = await pool.query('SELECT COUNT(*) ativos FROM banners WHERE ativo = 1');

  if (ativos >= 3) {
    return res.status(400).json({ erro: 'Só é permitido ter 3 banners ativos. Desative um antes de adicionar outro.' });
  }

  const [result] = await pool.query(
    'INSERT INTO banners (imagem_url, link_url, ordem, ativo) VALUES (?,?,?,1)',
    [imagemUrl, linkUrl, ordem]
  );
  res.status(201).json({ id: result.insertId });
});

// PUT /api/banners/:id
router.put('/:id', permitir('master', 'corretor'), async (req, res) => {
  const { imagemUrl, linkUrl, ordem, ativo } = req.body;
  await pool.query(
    'UPDATE banners SET imagem_url=?, link_url=?, ordem=?, ativo=? WHERE id=?',
    [imagemUrl, linkUrl, ordem, ativo ? 1 : 0, req.params.id]
  );
  res.json({ ok: true });
});

// DELETE /api/banners/:id
router.delete('/:id', permitir('master', 'corretor'), async (req, res) => {
  await pool.query('DELETE FROM banners WHERE id=?', [req.params.id]);
  res.json({ ok: true });
});

export default router;
