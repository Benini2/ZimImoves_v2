// Cria (ou atualiza a senha de) um usuário do dashboard.
// Uso: node scripts/createUser.js "Nome" email@exemplo.com senha123
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { pool } from '../db.js';

dotenv.config();

const [, , nome, email, senha] = process.argv;

if (!nome || !email || !senha) {
  console.log('Uso: node scripts/createUser.js "Nome" email@exemplo.com senha123');
  process.exit(1);
}

const hash = await bcrypt.hash(senha, 10);

await pool.query(
  `INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)
   ON DUPLICATE KEY UPDATE senha_hash = VALUES(senha_hash), nome = VALUES(nome)`,
  [nome, email, hash]
);

console.log(`Usuário ${email} criado/atualizado com sucesso.`);
process.exit(0);
