import { Router } from 'express';
import { autenticar, permitir } from '../middleware/auth.js';
import { upload, uploadMultiplas, uploadBanner, comprimirESalvar, salvarArquivoDeBanner } from '../middleware/upload.js';

const router = Router();

// POST /api/upload — uma imagem (campo "imagem"), usado na foto de capa e nos banners
router.post('/', autenticar, permitir('master', 'corretor'), upload.single('imagem'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ erro: 'Nenhuma imagem enviada.' });
  }
  try {
    const nomeArquivo = await comprimirESalvar(req.file.buffer);
    res.json({ url: `/uploads/${nomeArquivo}` });
  } catch (err) {
    console.error('Erro ao comprimir imagem:', err);
    res.status(500).json({ erro: 'Não foi possível processar a imagem.' });
  }
});

// POST /api/upload/multiplas — várias imagens de uma vez (campo "imagens"), usado na galeria
router.post('/multiplas', autenticar, permitir('master', 'corretor'), uploadMultiplas.array('imagens', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ erro: 'Nenhuma imagem enviada.' });
  }
  try {
    const urls = await Promise.all(
      req.files.map((arquivo) => comprimirESalvar(arquivo.buffer).then((nome) => `/uploads/${nome}`))
    );
    res.json({ urls });
  } catch (err) {
    console.error('Erro ao comprimir imagens:', err);
    res.status(500).json({ erro: 'Não foi possível processar as imagens.' });
  }
});

// POST /api/upload/banner — imagem OU vídeo curto (mudo, em loop), só para os banners da vitrine
router.post('/banner', autenticar, permitir('master', 'corretor'), uploadBanner.single('arquivo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
  }
  try {
    const nomeArquivo = await salvarArquivoDeBanner(req.file);
    res.json({ url: `/uploads/${nomeArquivo}`, tipo: req.file.mimetype.startsWith('video/') ? 'video' : 'imagem' });
  } catch (err) {
    console.error('Erro ao salvar banner:', err);
    res.status(500).json({ erro: 'Não foi possível processar o arquivo.' });
  }
});

// Middleware de erro do multer (tamanho/tipo inválido)
router.use((err, req, res, next) => {
  res.status(400).json({ erro: err.message || 'Erro ao enviar a imagem.' });
});

export default router;
