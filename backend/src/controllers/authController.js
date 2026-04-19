const bcrypt = require('bcryptjs');
const { z } = require('zod');
const { prisma } = require('../config/db');
const { signAccess, signRefresh, verify } = require('../utils/jwt');
const { requestOtp, verifyOtp } = require('../services/otpService');

const phoneSchema = z.string().regex(/^\+221[0-9]{9}$/, 'Numéro sénégalais requis (+221XXXXXXXXX)');

exports.register = async (req, res, next) => {
  try {
    const schema = z.object({
      phone: phoneSchema,
      name: z.string().min(2).max(80),
      email: z.string().email().optional(),
      password: z.string().min(6).optional(),
      city: z.string().optional(),
    });
    const data = schema.parse(req.body);

    const exists = await prisma.user.findFirst({
      where: { OR: [{ phone: data.phone }, data.email ? { email: data.email } : undefined].filter(Boolean) },
    });
    if (exists) {
      return res.status(409).json({ error: { code: 'USER_EXISTS', message: 'Compte déjà existant' } });
    }

    const user = await prisma.user.create({
      data: {
        phone: data.phone,
        email: data.email,
        name: data.name,
        city: data.city || 'Dakar',
        passwordHash: data.password ? await bcrypt.hash(data.password, 10) : null,
      },
    });

    await requestOtp(data.phone);
    res.status(201).json({ userId: user.id, otpSent: true });
  } catch (err) {
    next(err);
  }
};

exports.requestOtpCtrl = async (req, res, next) => {
  try {
    const { phone } = z.object({ phone: phoneSchema }).parse(req.body);
    const { expiresAt } = await requestOtp(phone);
    res.json({ ok: true, expiresAt });
  } catch (err) {
    next(err);
  }
};

exports.verifyOtpCtrl = async (req, res, next) => {
  try {
    const { phone, code } = z.object({ phone: phoneSchema, code: z.string().length(6) }).parse(req.body);
    const result = await verifyOtp(phone, code);
    if (!result.ok) {
      return res.status(400).json({ error: { code: result.reason, message: 'Code invalide ou expiré' } });
    }

    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({ data: { phone, name: 'Utilisateur', isVerified: true } });
    } else if (!user.isVerified) {
      user = await prisma.user.update({ where: { id: user.id }, data: { isVerified: true } });
    }

    res.json({
      accessToken: signAccess({ sub: user.id, role: user.role }),
      refreshToken: signRefresh({ sub: user.id }),
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = z.object({ email: z.string().email(), password: z.string().min(6) }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Identifiants invalides' } });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Identifiants invalides' } });

    res.json({
      accessToken: signAccess({ sub: user.id, role: user.role }),
      refreshToken: signRefresh({ sub: user.id }),
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const payload = verify(refreshToken);
    if (payload.kind !== 'refresh') throw new Error('NOT_REFRESH');
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new Error('USER_NOT_FOUND');
    res.json({
      accessToken: signAccess({ sub: user.id, role: user.role }),
    });
  } catch {
    res.status(401).json({ error: { code: 'INVALID_REFRESH', message: 'Refresh invalide' } });
  }
};

exports.me = async (req, res) => res.json(publicUser(req.user));

exports.updateMe = async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2).max(80).optional(),
      avatarUrl: z.string().url().optional(),
      city: z.string().optional(),
      lang: z.enum(['fr', 'wo']).optional(),
      fcmToken: z.string().optional(),
    });
    const data = schema.parse(req.body);
    const updated = await prisma.user.update({ where: { id: req.user.id }, data });
    res.json(publicUser(updated));
  } catch (err) {
    next(err);
  }
};

function publicUser(u) {
  return {
    id: u.id,
    phone: u.phone,
    email: u.email,
    name: u.name,
    avatarUrl: u.avatarUrl,
    city: u.city,
    role: u.role,
    isVerified: u.isVerified,
    ratingAvg: u.ratingAvg,
    ratingCount: u.ratingCount,
    lang: u.lang,
  };
}
