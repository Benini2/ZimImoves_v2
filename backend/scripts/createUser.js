// Cria (ou atualiza a senha de) um usuário do dashboard.
// Uso: node scripts/createUser.js "Nome" email@exemplo.com senha123 [master|corretor|visualizador]
// Se não informar o papel, usa "master" — pensado pra criar o primeiro usuário do painel.
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { pool } from '../db.js';

dotenv.config();

const [, , nome, email, senha, roleInformado] = process.argv;
const role = roleInformado || 'master';

if (!nome || !email || !senha) {
  console.log('Uso: node scripts/createUser.js "Nome" email@exemplo.com senha123 [master|corretor|visualizador]');
  process.exit(1);
}

if (!['master', 'corretor', 'visualizador'].includes(role)) {
  console.log('Papel inválido. Use: master, corretor ou visualizador.');
  process.exit(1);
}

const hash = await bcrypt.hash(senha, 10);

await pool.query(
  `INSERT INTO usuarios (nome, email, senha_hash, role) VALUES (?, ?, ?, ?)
   ON DUPLICATE KEY UPDATE senha_hash = VALUES(senha_hash), nome = VALUES(nome), role = VALUES(role)`,
  [nome, email, hash, role]
);

console.log(`Usuário ${email} (${role}) criado/atualizado com sucesso.`);
process.exit(0);
