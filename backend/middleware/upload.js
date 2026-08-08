import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pasta = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(pasta)) fs.mkdirSync(pasta, { recursive: true });

// Guarda o arquivo em memória (não escreve direto no disco), pra dar tempo
// da gente comprimir com a sharp antes de decidir onde ele vai parar.
const storage = multer.memoryStorage();

function filtroArquivo(req, file, cb) {
  const tiposAceitos = /jpeg|jpg|png|webp/;
  const extensaoOk = tiposAceitos.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = tiposAceitos.test(file.mimetype);
  if (extensaoOk && mimeOk) return cb(null, true);
  cb(new Error('Envie apenas imagens JPG, PNG ou WEBP.'));
}

export const upload = multer({
  storage,
  fileFilter: filtroArquivo,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB — a foto original pode chegar grande, ela é comprimida depois
});

// Mesmo storage, mas aceitando vários arquivos de uma vez (galeria de fotos)
export const uploadMultiplas = multer({
  storage,
  fileFilter: filtroArquivo,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const LARGURA_MAXIMA = 1920; // suficiente pra tela cheia em qualquer monitor comum
const QUALIDADE_JPEG = 82; // bom equilíbrio entre qualidade visual e tamanho de arquivo

// Redimensiona (se for maior que o necessário) e comprime a imagem, salvando sempre como .jpg.
// Devolve o nome do arquivo já salvo em disco.
export async function comprimirESalvar(buffer) {
  const nomeArquivo = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
  const caminho = path.join(pasta, nomeArquivo);

  await sharp(buffer)
    .rotate() // corrige a orientação de fotos tiradas com celular (dado EXIF)
    .resize({ width: LARGURA_MAXIMA, withoutEnlargement: true })
    .jpeg({ quality: QUALIDADE_JPEG, mozjpeg: true })
    .toFile(caminho);

  return nomeArquivo;
}

/* ---------- Upload de banner: aceita imagem OU vídeo curto (mudo, em loop) ---------- */

function filtroArquivoBanner(req, file, cb) {
  const aceitos = /jpeg|jpg|png|webp|mp4|webm/;
  const extensaoOk = aceitos.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = /^image\/(jpeg|jpg|png|webp)$|^video\/(mp4|webm)$/.test(file.mimetype);
  if (extensaoOk && mimeOk) return cb(null, true);
  cb(new Error('Envie uma imagem (JPG, PNG, WEBP) ou um vídeo curto (MP4, WEBM).'));
}

export const uploadBanner = multer({
  storage,
  fileFilter: filtroArquivoBanner,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB — vídeo pesa mais que imagem
});

// Vídeo não passa pela sharp (não é imagem) — só salva o arquivo como veio, mantendo a extensão.
// Imagem continua sendo comprimida normalmente pela mesma função de sempre.
export async function salvarArquivoDeBanner(arquivo) {
  if (arquivo.mimetype.startsWith('video/')) {
    const extensao = arquivo.mimetype === 'video/webm' ? 'webm' : 'mp4';
    const nomeArquivo = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extensao}`;
    fs.writeFileSync(path.join(pasta, nomeArquivo), arquivo.buffer);
    return nomeArquivo;
  }
  return comprimirESalvar(arquivo.buffer);
}
