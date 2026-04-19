const { verify } = require('../utils/jwt');
const { prisma } = require('../config/db');

async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: { code: 'NO_TOKEN', message: 'Authentification requise' } });

    const payload = verify(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ error: { code: 'USER_INACTIVE', message: 'Compte non actif' } });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Token invalide ou expiré' } });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Accès refusé' } });
    }
    next();
  };
}

// Vendeur avec abonnement actif
async function requireActiveSeller(req, res, next) {
  const now = new Date();
  const sub = await prisma.subscription.findFirst({
    where: {
      userId: req.user.id,
      status: 'ACTIVE',
      endsAt: { gt: now },
    },
    orderBy: { endsAt: 'desc' },
  });
  if (!sub) {
    return res.status(402).json({
      error: { code: 'SUBSCRIPTION_REQUIRED', message: 'Abonnement vendeur requis' },
    });
  }
  req.subscription = sub;
  next();
}

module.exports = { authRequired, requireRole, requireActiveSeller };
