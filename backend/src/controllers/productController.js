const { z } = require('zod');
const { prisma } = require('../config/db');

exports.list = async (req, res, next) => {
  try {
    const {
      q, category, city, minPrice, maxPrice, cursor, limit = '20',
    } = req.query;
    const where = { status: 'PUBLISHED' };
    if (category) where.categoryId = category;
    if (city) where.city = city;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const take = Math.min(Number(limit) || 20, 50);
    const items = await prisma.product.findMany({
      where,
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: [{ isPromoted: 'desc' }, { createdAt: 'desc' }],
      include: {
        images: { take: 1, orderBy: { order: 'asc' } },
        seller: { select: { id: true, name: true, avatarUrl: true, ratingAvg: true, isVerified: true } },
      },
    });
    const hasMore = items.length > take;
    const results = hasMore ? items.slice(0, take) : items;
    res.json({
      items: results,
      nextCursor: hasMore ? results[results.length - 1].id : null,
    });
  } catch (err) {
    next(err);
  }
};

exports.detail = async (req, res, next) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { views: { increment: 1 } },
      include: {
        images: { orderBy: { order: 'asc' } },
        category: true,
        seller: {
          select: {
            id: true, name: true, avatarUrl: true, city: true, ratingAvg: true,
            ratingCount: true, isVerified: true, createdAt: true,
          },
        },
      },
    });
    res.json(product);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Produit introuvable' } });
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const schema = z.object({
      title: z.string().min(3).max(120),
      description: z.string().min(10),
      price: z.number().int().positive(),
      categoryId: z.string(),
      city: z.string(),
      address: z.string().optional(),
      stock: z.number().int().positive().default(1),
      images: z.array(z.object({ url: z.string().url(), publicId: z.string().optional() })).max(6).default([]),
    });
    const data = schema.parse(req.body);

    const product = await prisma.product.create({
      data: {
        sellerId: req.user.id,
        title: data.title,
        description: data.description,
        price: data.price,
        categoryId: data.categoryId,
        city: data.city,
        address: data.address,
        stock: data.stock,
        status: 'PENDING_REVIEW',
        images: { create: data.images.map((img, i) => ({ url: img.url, publicId: img.publicId, order: i })) },
      },
      include: { images: true },
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Introuvable' } });
    if (existing.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Pas propriétaire' } });
    }
    const schema = z.object({
      title: z.string().min(3).max(120).optional(),
      description: z.string().min(10).optional(),
      price: z.number().int().positive().optional(),
      categoryId: z.string().optional(),
      city: z.string().optional(),
      stock: z.number().int().min(0).optional(),
      status: z.enum(['DRAFT', 'PUBLISHED', 'HIDDEN', 'SOLD']).optional(),
    });
    const data = schema.parse(req.body);
    const updated = await prisma.product.update({ where: { id: req.params.id }, data });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Introuvable' } });
    if (existing.sellerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Pas propriétaire' } });
    }
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

exports.mine = async (req, res, next) => {
  try {
    const items = await prisma.product.findMany({
      where: { sellerId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { images: { take: 1, orderBy: { order: 'asc' } } },
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

exports.categories = async (_req, res, next) => {
  try {
    const cats = await prisma.category.findMany({
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
    res.json({ items: cats });
  } catch (err) {
    next(err);
  }
};

exports.promote = async (req, res, next) => {
  try {
    const { days = 7 } = req.body;
    const promoUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { isPromoted: true, promoUntil },
    });
    res.json(product);
    // TODO: chaîner avec paymentService.initiatePayment
  } catch (err) {
    next(err);
  }
};
