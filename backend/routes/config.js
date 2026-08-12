import { Router } from 'express';
import { pool } from '../db.js';
import { autenticar, permitir } from '../middleware/auth.js';

const router = Router();

const PADRAO = {
  hero_titulo: 'Encontre o lar||que você merece',
  hero_subtitulo: 'Imóveis selecionados, atendimento personalizado e as melhores oportunidades do mercado.',
};

async function buscarTodas() {
  const [rows] = await pool.query('SELECT chave, valor FROM configuracoes');
  const mapa = { ...PADRAO };
  rows.forEach((r) => { mapa[r.chave] = r.valor; });
  return mapa;
}

// GET /api/config/publico — usado pela vitrine (sem login)
router.get('/publico', async (req, res) => {
  res.json(await buscarTodas());
});

// GET /api/config — usado no painel, pra preencher o formulário
router.get('/', autenticar, async (req, res) => {
  res.json(await buscarTodas());
});

// PUT /api/config — salva uma ou mais chaves de uma vez: { hero_titulo, hero_subtitulo }
router.put('/', autenticar, permitir('master', 'corretor'), async (req, res) => {
  const entradas = Object.entries(req.body).filter(([chave]) => Object.keys(PADRAO).includes(chave));
  for (const [chave, valor] of entradas) {
    await pool.query(
      'INSERT INTO configuracoes (chave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = VALUES(valor)',
      [chave, valor]
    );
  }
  res.json({ ok: true });
});

export default router;
