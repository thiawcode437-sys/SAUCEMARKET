const { z } = require('zod');
const { prisma } = require('../config/db');

exports.listUsers = async (req, res, next) => {
  try {
    const { q, role, status, cursor, limit = '30' } = req.query;
    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }
    const take = Math.min(Number(limit), 100);
    const items = await prisma.user.findMany({
      where,
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
    });
    const hasMore = items.length > take;
    res.json({
      items: (hasMore ? items.slice(0, take) : items).map((u) => ({ ...u, passwordHash: undefined })),
      nextCursor: hasMore ? items[take - 1].id : null,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const schema = z.object({
      status: z.enum(['ACTIVE', 'SUSPENDED', 'BANNED']).optional(),
      isVerified: z.boolean().optional(),
      role: z.enum(['BUYER', 'SELLER', 'ADMIN']).optional(),
    });
    const data = schema.parse(req.body);
    const updated = await prisma.user.update({ where: { id: req.params.id }, data });
    res.json({ ...updated, passwordHash: undefined });
  } catch (err) {
    next(err);
  }
};

exports.listSubscriptions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const items = await prisma.subscription.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { user: { select: { id: true, name: true, phone: true } } },
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

exports.moderateProducts = async (req, res, next) => {
  try {
    const status = req.query.status || 'PENDING_REVIEW';
    const items = await prisma.product.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        images: { take: 1 },
        seller: { select: { id: true, name: true, phone: true } },
      },
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

exports.approveProduct = async (req, res, next) => {
  try {
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: { status: 'PUBLISHED' },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.rejectProduct = async (req, res, next) => {
  try {
    const { reason } = z.object({ reason: z.string().min(3) }).parse(req.body);
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED', rejectedReason: reason },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.listReports = async (req, res, next) => {
  try {
    const status = req.query.status || 'OPEN';
    const items = await prisma.report.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { reporter: { select: { id: true, name: true } } },
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

exports.globalStats = async (_req, res, next) => {
  try {
    const monthAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const [users, sellers, products, gmv, activeSubs] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'SELLER' } }),
      prisma.product.count({ where: { status: 'PUBLISHED' } }),
      prisma.order.aggregate({
        where: { status: { in: ['PAID', 'DELIVERED'] }, paidAt: { gte: monthAgo } },
        _sum: { amount: true, commission: true },
        _count: true,
      }),
      prisma.subscription.count({ where: { status: 'ACTIVE', endsAt: { gt: new Date() } } }),
    ]);
    res.json({
      users,
      sellers,
      activeSubs,
      productsPublished: products,
      mrrFromSubs: activeSubs * Number(process.env.SUBSCRIPTION_MONTHLY_FCFA || 1000),
      monthlyGMV: gmv._sum.amount || 0,
      monthlyCommission: gmv._sum.commission || 0,
      monthlyOrders: gmv._count,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateConfig = async (req, res, next) => {
  try {
    const { key, value } = z.object({ key: z.string(), value: z.string() }).parse(req.body);
    const cfg = await prisma.appConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    res.json(cfg);
  } catch (err) {
    next(err);
  }
};
