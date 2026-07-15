// Middleware que protege rotas verificando o token JWT.
// O token deve vir no header: Authorization: Bearer <token>
import { verifyToken } from '../services/auth.service.js';

export function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Token ausente ou inválido.' });
    }

    const decoded = verifyToken(token);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token expirado ou inválido.' });
  }
}

// Anexa o usuário se o token existir, mas não bloqueia (uso opcional)
export function optionalAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');
    if (token) {
      const decoded = verifyToken(token);
      req.user = { id: decoded.id, email: decoded.email };
    }
  } catch (_) {
    /* ignora token inválido em rotas opcionais */
  }
  next();
}
