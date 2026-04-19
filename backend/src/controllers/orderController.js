const { z } = require('zod');
const { prisma } = require('../config/db');
const { initiatePayment } = require('../services/paymentService');

const COMMISSION_RATE = Number(process.env.COMMISSION_RATE || 0.05);

exports.create = async (req, res, next) => {
  try {
    const { productId, quantity, provider } = z.object({
      productId: z.string(),
      quantity: z.number().int().positive().default(1),
      provider: z.enum(['WAVE', 'ORANGE_MONEY', 'FREE_MONEY', 'PAYDUNYA', 'CARD']),
    }).parse(req.body);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.status !== 'PUBLISHED') {
      return res.status(404).json({ error: { code: 'PRODUCT_UNAVAILABLE', message: 'Produit indisponible' } });
    }
    if (product.sellerId === req.user.id) {
      return res.status(400).json({ error: { code: 'SELF_BUY', message: 'Achat de son propre produit interdit' } });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ error: { code: 'OUT_OF_STOCK', message: 'Stock insuffisant' } });
    }

    const amount = product.price * quantity;
    const commission = Math.round(amount * COMMISSION_RATE);

    const order = await prisma.order.create({
      data: {
        buyerId: req.user.id,
        sellerId: product.sellerId,
        productId,
        quantity,
        amount,
        commission,
        provider,
        status: 'PENDING_PAYMENT',
      },
    });

    const payment = await initiatePayment({
      provider,
      amount,
      description: `Achat : ${product.title}`,
      callbackUrl: `${process.env.APP_URL}/v1/webhooks/payment`,
      metadata: { ref: order.id, type: 'ORDER' },
      customer: { phone: req.user.phone, name: req.user.name },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { providerRef: payment.reference },
    });

    res.status(201).json({ order, paymentUrl: payment.paymentUrl });
  } catch (err) {
    next(err);
  }
};

exports.mine = async (req, res, next) => {
  try {
    const { role = 'buyer' } = req.query;
    const where = role === 'seller' ? { sellerId: req.user.id } : { buyerId: req.user.id };
    const items = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { include: { images: { take: 1 } } },
        buyer: { select: { id: true, name: true, avatarUrl: true } },
        seller: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

exports.detail = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { product: { include: { images: true } }, buyer: true, seller: true },
    });
    if (!order) return res.status(404).json({ error: { code: 'NOT_FOUND' } });
    if (![order.buyerId, order.sellerId].includes(req.user.id) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: { code: 'FORBIDDEN' } });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
};

exports.confirm = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: { code: 'NOT_FOUND' } });
    if (order.buyerId !== req.user.id) return res.status(403).json({ error: { code: 'FORBIDDEN' } });
    if (order.status !== 'SHIPPED' && order.status !== 'PAID') {
      return res.status(400).json({ error: { code: 'INVALID_STATE', message: 'Commande non livrée' } });
    }
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'DELIVERED' },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.dispute = async (req, res, next) => {
  try {
    const { reason } = z.object({ reason: z.string().min(5).max(500) }).parse(req.body);
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: { code: 'NOT_FOUND' } });
    if (![order.buyerId, order.sellerId].includes(req.user.id)) {
      return res.status(403).json({ error: { code: 'FORBIDDEN' } });
    }
    const [updated] = await prisma.$transaction([
      prisma.order.update({ where: { id: order.id }, data: { status: 'DISPUTED' } }),
      prisma.report.create({
        data: {
          reporterId: req.user.id,
          targetType: 'ORDER',
          targetId: order.id,
          reason: 'DISPUTE',
          details: reason,
        },
      }),
    ]);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
