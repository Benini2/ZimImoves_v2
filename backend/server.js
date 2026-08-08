import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import authRoutes from './routes/auth.js';
import imoveisRoutes from './routes/imoveis.js';
import bannersRoutes from './routes/banners.js';
import uploadRoutes from './routes/upload.js';
import configRoutes from './routes/config.js';
import { ehRoboDePreVia } from './middleware/crawler.js';
import { paginaDePreViaDoImovel } from './routes/previa.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/imoveis', imoveisRoutes);
app.use('/api/banners', bannersRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/config', configRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Quando o robô do WhatsApp/Facebook/etc. busca o link de um imóvel, devolve a prévia certa.
// Para qualquer outra pessoa, isso não faz nada — segue pro site normal, o React Router assume.
app.get('/imovel/:id', (req, res, next) => {
  if (ehRoboDePreVia(req.headers['user-agent'])) {
    return paginaDePreViaDoImovel(req, res);
  }
  next();
});

// Serve o site (frontend) já buildado. Só existe depois de rodar `npm run build` na pasta frontend.
// Em desenvolvimento isso não é usado (o Vite serve o frontend separado, na porta 5173) — só entra
// em ação quando o backend roda sozinho em produção, servindo tudo pelo mesmo endereço.
const pastaFrontend = path.join(__dirname, '../frontend/dist');
app.use(express.static(pastaFrontend));
app.get('*', (req, res) => {
  res.sendFile(path.join(pastaFrontend, 'index.html'), (err) => {
    if (err) res.status(404).send('Site ainda não foi buildado (rode "npm run build" no frontend).');
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API rodando em http://localhost:${PORT}`));
