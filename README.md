# Sistema da imobiliária

Projeto dividido em duas partes:
- `backend/` — API em Node + Express + MySQL
- `frontend/` — React + Vite (dashboard interno em `/dashboard`, login em `/login`)

Nesta etapa foi construído o **dashboard**. A vitrine pública (`/`, catálogo, detalhe do imóvel) entra na próxima etapa.

## 1. Banco de dados

1. Crie o banco rodando o script `backend/sql/schema.sql` no seu MySQL:
   ```
   mysql -u root -p < backend/sql/schema.sql
   ```

## 2. Backend

```
cd backend
cp .env.example .env
# edite o .env com os dados do seu MySQL
npm install
npm run create-user -- "Seu Nome" seuemail@gmail.com suaSenha123
npm run dev
```
A API sobe em `http://localhost:3001`.

O login do dashboard usa e-mail e senha (pode ser seu e-mail do Gmail, é só um e-mail cadastrado na tabela `usuarios` — não é uma integração com login do Google).

## 3. Frontend

```
cd frontend
cp .env.example .env
npm install
npm run dev
```
Acesse `http://localhost:5173/login` para entrar no painel com o e-mail e senha criados no passo anterior. Depois do login, o dashboard fica em `/dashboard`.

## O que já funciona no dashboard
- Login protegido por token (JWT), rota `/login`
- Listagem de imóveis com cards de resumo (total, postados, não postados, vendidos)
- Filtros por status, tipo (apartamento, casa, terreno, sala comercial) e faixa de preço
- Cadastro e edição de imóvel, com lista fixa de comodidades + campo para adicionar itens que não estão na lista
- Alterar status do imóvel (postado / não postado / vendido) direto na listagem
- Excluir imóvel
- Gerenciar até 3 banners que aparecerão no carrossel da vitrine

## Próxima etapa
Construir a vitrine pública consumindo os endpoints `/api/imoveis/publico`, `/api/imoveis/publico/destaques` e `/api/banners/publico`, que já estão prontos no backend.
