-- Banco de dados da imobiliária
CREATE DATABASE IF NOT EXISTS imobiliaria CHARACTER SET utf8mb4;
USE imobiliaria;

-- Usuários do dashboard (login por e-mail e senha)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  -- master: gerencia usuários e tem acesso total
  -- corretor: cadastra, edita e exclui imóveis/banners
  -- visualizador: só consegue ver as telas, sem alterar nada
  role ENUM('master', 'corretor', 'visualizador') NOT NULL DEFAULT 'corretor',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Imóveis
CREATE TABLE IF NOT EXISTS imoveis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  preco DECIMAL(12,2) NOT NULL,
  tipo ENUM('apartamento','casa','terreno','sala_comercial') NOT NULL,
  status ENUM('postado','nao_postado','vendido') NOT NULL DEFAULT 'nao_postado',
  cidade VARCHAR(100),
  estado VARCHAR(2),
  bairro VARCHAR(100),
  quartos INT DEFAULT NULL,
  suites INT DEFAULT NULL,
  vagas INT DEFAULT NULL,
  area_terreno DECIMAL(10,2) DEFAULT NULL,
  area_construida DECIMAL(10,2) DEFAULT NULL,
  descricao TEXT,
  foto_capa VARCHAR(255),
  -- lista de comodidades: itens fixos marcados + itens digitados manualmente
  -- guardado como JSON, ex: ["Piscina", "Churrasqueira", "Sauna com hidro"]
  comodidades JSON,
  destaque TINYINT(1) NOT NULL DEFAULT 0,
  -- Campos privados: nunca são devolvidos pelas rotas públicas (/publico), só no painel logado
  proprietario_nome VARCHAR(150),
  proprietario_contato VARCHAR(100),
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Fotos adicionais de cada imóvel (galeria)
CREATE TABLE IF NOT EXISTS imovel_fotos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  imovel_id INT NOT NULL,
  url VARCHAR(255) NOT NULL,
  ordem INT DEFAULT 0,
  FOREIGN KEY (imovel_id) REFERENCES imoveis(id) ON DELETE CASCADE
);

-- Banners do carrossel da vitrine (máximo 3, controlado na aplicação)
CREATE TABLE IF NOT EXISTS banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  imagem_url VARCHAR(255) NOT NULL,
  link_url VARCHAR(255),
  ordem INT DEFAULT 0,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Configurações gerais da vitrine (textos editáveis, etc.)
CREATE TABLE IF NOT EXISTS configuracoes (
  chave VARCHAR(60) PRIMARY KEY,
  valor TEXT
);

-- Usuário admin inicial (troque a senha depois do primeiro login)
-- senha: admin123  (hash gerado com bcrypt, ver README para gerar a sua)
-- INSERT INTO usuarios (nome, email, senha_hash) VALUES ('Admin', 'admin@imobiliaria.com', '$2b$10$SEU_HASH_AQUI');
