import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';
import { autenticar, permitir } from '../middleware/auth.js';

const router = Router();

// Todas as rotas daqui exigem estar logado E ser master
router.use(autenticar, permitir('master'));

// GET /api/usuarios — lista todo mundo que tem acesso ao painel
router.get('/', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, nome, email, role, criado_em FROM usuarios ORDER BY criado_em ASC'
  );
  res.json(rows);
});

// POST /api/usuarios — cadastra um novo usuário (corretor ou visualizador, ou outro master)
router.post('/', async (req, res) => {
  const { nome, email, senha, role } = req.body;

  if (!nome || !email || !senha || !role) {
    return res.status(400).json({ erro: 'Preencha nome, e-mail, senha e o tipo de usuário.' });
  }
  if (!['master', 'corretor', 'visualizador'].includes(role)) {
    return res.status(400).json({ erro: 'Tipo de usuário inválido.' });
  }

  try {
    const hash = await bcrypt.hash(senha, 10);
    const [result] = await pool.query(
      'INSERT INTO usuarios (nome, email, senha_hash, role) VALUES (?, ?, ?, ?)',
      [nome, email, hash, role]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ erro: 'Já existe um usuário com esse e-mail.' });
    }
    console.error(err);
    res.status(500).json({ erro: 'Não foi possível criar o usuário.' });
  }
});

// PUT /api/usuarios/:id — edita nome/e-mail/papel, e a senha só se for enviada
router.put('/:id', async (req, res) => {
  const { nome, email, senha, role } = req.body;

  if (!['master', 'corretor', 'visualizador'].includes(role)) {
    return res.status(400).json({ erro: 'Tipo de usuário inválido.' });
  }

  // Ninguém pode tirar o próprio acesso de master (evita ficar sem admin nenhum por engano)
  if (Number(req.params.id) === req.usuario.id && role !== 'master') {
    return res.status(400).json({ erro: 'Você não pode remover seu próprio acesso de master.' });
  }

  try {
    if (senha) {
      const hash = await bcrypt.hash(senha, 10);
      await pool.query(
        'UPDATE usuarios SET nome=?, email=?, senha_hash=?, role=? WHERE id=?',
        [nome, email, hash, role, req.params.id]
      );
    } else {
      await pool.query(
        'UPDATE usuarios SET nome=?, email=?, role=? WHERE id=?',
        [nome, email, role, req.params.id]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ erro: 'Já existe um usuário com esse e-mail.' });
    }
    console.error(err);
    res.status(500).json({ erro: 'Não foi possível salvar as alterações.' });
  }
});

// DELETE /api/usuarios/:id
router.delete('/:id', async (req, res) => {
  if (Number(req.params.id) === req.usuario.id) {
    return res.status(400).json({ erro: 'Você não pode excluir a própria conta.' });
  }

  const [[{ totalMasters }]] = await pool.query(
    "SELECT COUNT(*) totalMasters FROM usuarios WHERE role = 'master'"
  );
  const [[alvo]] = await pool.query('SELECT role FROM usuarios WHERE id = ?', [req.params.id]);

  if (alvo?.role === 'master' && totalMasters <= 1) {
    return res.status(400).json({ erro: 'Precisa existir pelo menos um usuário master.' });
  }

  await pool.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

export default router;
