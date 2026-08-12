-- Rode isso no seu banco de produção (via SSH/mysql), pra quem já tinha usuário cadastrado antes.
-- mysql -u zimv2 -p zimimoveisv2 < backend/sql/migracao_papel_usuario.sql

ALTER TABLE usuarios
  ADD COLUMN role ENUM('master', 'corretor', 'visualizador') NOT NULL DEFAULT 'corretor' AFTER senha_hash;

-- Deixa o(s) usuário(s) que já existem como master, já que até agora só tinha o admin principal.
-- Se você tiver mais de um usuário cadastrado e quiser que só um seja master, ajuste o WHERE.
UPDATE usuarios SET role = 'master';
