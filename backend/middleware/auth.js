import jwt from 'jsonwebtoken';

// Protege rotas do dashboard: exige um token válido no header Authorization.
export function autenticar(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ erro: 'Não autenticado.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload;
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Sessão expirada ou inválida. Faça login novamente.' });
  }
}

// Restringe uma rota a papéis específicos. Use depois de "autenticar".
// Ex: router.post('/', autenticar, permitir('master', 'corretor'), async (req, res) => {...})
export function permitir(...papeisPermitidos) {
  return (req, res, next) => {
    if (!papeisPermitidos.includes(req.usuario?.role)) {
      return res.status(403).json({ erro: 'Você não tem permissão para fazer isso.' });
    }
    next();
  };
}
