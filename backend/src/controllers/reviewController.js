const { z } = require('zod');
const { prisma } = require('../config/db');

exports.create = async (req, res, next) => {
  try {
    const schema = z.object({
      targetId: z.string(),
      rating: z.number().int().min(1).max(5),
      comment: z.string().max(500).optional(),
      orderId: z.string().optional(),
      productId: z.string().optional(),
    });
    const data = schema.parse(req.body);
    if (data.targetId === req.user.id) {
      return res.status(400).json({ error: { code: 'SELF_REVIEW', message: 'Auto-avis interdit' } });
    }

    const review = await prisma.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: { ...data, authorId: req.user.id },
      });
      const agg = await tx.review.aggregate({
        where: { targetId: data.targetId },
        _avg: { rating: true },
        _count: true,
      });
      await tx.user.update({
        where: { id: data.targetId },
        data: {
          ratingAvg: Number((agg._avg.rating || 0).toFixed(2)),
          ratingCount: agg._count,
        },
      });
      return created;
    });

    res.status(201).json(review);
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: { code: 'ALREADY_REVIEWED', message: 'Déjà noté' } });
    }
    next(err);
  }
};

exports.listForUser = async (req, res, next) => {
  try {
    const items = await prisma.review.findMany({
      where: { targetId: req.params.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

exports.report = async (req, res, next) => {
  try {
    const schema = z.object({
      targetType: z.enum(['PRODUCT', 'USER', 'MESSAGE']),
      targetId: z.string(),
      reason: z.string().min(3).max(100),
      details: z.string().max(1000).optional(),
    });
    const data = schema.parse(req.body);
    const report = await prisma.report.create({
      data: { ...data, reporterId: req.user.id },
    });
    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
};
