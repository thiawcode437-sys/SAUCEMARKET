const { z } = require('zod');
const { prisma } = require('../config/db');

exports.listConversations = async (req, res, next) => {
  try {
    const convs = await prisma.conversation.findMany({
      where: { OR: [{ buyerId: req.user.id }, { sellerId: req.user.id }] },
      orderBy: { updatedAt: 'desc' },
      include: {
        buyer: { select: { id: true, name: true, avatarUrl: true } },
        seller: { select: { id: true, name: true, avatarUrl: true } },
        product: {
          select: { id: true, title: true, price: true, images: { take: 1 } },
        },
      },
    });
    res.json({ items: convs });
  } catch (err) {
    next(err);
  }
};

exports.openConversation = async (req, res, next) => {
  try {
    const { productId } = z.object({ productId: z.string() }).parse(req.body);
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Produit introuvable' } });
    if (product.sellerId === req.user.id) {
      return res.status(400).json({ error: { code: 'SELF_CONV', message: 'C\'est ton propre produit' } });
    }
    const conv = await prisma.conversation.upsert({
      where: {
        buyerId_sellerId_productId: {
          buyerId: req.user.id,
          sellerId: product.sellerId,
          productId,
        },
      },
      update: {},
      create: { buyerId: req.user.id, sellerId: product.sellerId, productId },
    });
    res.status(201).json(conv);
  } catch (err) {
    next(err);
  }
};

exports.listMessages = async (req, res, next) => {
  try {
    const conv = await prisma.conversation.findUnique({ where: { id: req.params.id } });
    if (!conv) return res.status(404).json({ error: { code: 'NOT_FOUND' } });
    if (![conv.buyerId, conv.sellerId].includes(req.user.id)) {
      return res.status(403).json({ error: { code: 'FORBIDDEN' } });
    }
    const { cursor, limit = '50' } = req.query;
    const take = Math.min(Number(limit), 100);
    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.id },
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });
    const hasMore = messages.length > take;
    res.json({
      items: hasMore ? messages.slice(0, take) : messages,
      nextCursor: hasMore ? messages[take - 1].id : null,
    });
  } catch (err) {
    next(err);
  }
};

exports.send = async (req, res, next) => {
  try {
    const { body, imageUrl } = z.object({
      body: z.string().optional(),
      imageUrl: z.string().url().optional(),
    }).refine((v) => v.body || v.imageUrl, { message: 'Contenu requis' }).parse(req.body);

    const conv = await prisma.conversation.findUnique({ where: { id: req.params.id } });
    if (!conv) return res.status(404).json({ error: { code: 'NOT_FOUND' } });
    if (![conv.buyerId, conv.sellerId].includes(req.user.id)) {
      return res.status(403).json({ error: { code: 'FORBIDDEN' } });
    }
    const msg = await prisma.message.create({
      data: { conversationId: conv.id, senderId: req.user.id, body, imageUrl },
    });
    await prisma.conversation.update({
      where: { id: conv.id },
      data: { lastMessage: body || '📷 Image' },
    });
    res.status(201).json(msg);
  } catch (err) {
    next(err);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    await prisma.message.updateMany({
      where: {
        conversationId: req.params.id,
        senderId: { not: req.user.id },
        readAt: null,
      },
      data: { readAt: new Date() },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
