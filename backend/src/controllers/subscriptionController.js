const { z } = require('zod');
const { prisma } = require('../config/db');
const { initiatePayment, verifyWaveSignature } = require('../services/paymentService');

const PLAN_MONTHLY = {
  key: 'MONTHLY_1000',
  amount: Number(process.env.SUBSCRIPTION_MONTHLY_FCFA || 1000),
  durationDays: 30,
  label: 'Mensuel vendeur',
};

exports.plans = (_req, res) => {
  res.json({
    items: [{
      key: PLAN_MONTHLY.key,
      amount: PLAN_MONTHLY.amount,
      currency: 'XOF',
      label: PLAN_MONTHLY.label,
      duration: '30 jours',
      features: [
        'Publication d\'annonces illimitées',
        'Badge vendeur vérifié',
        'Statistiques avancées',
        'Support prioritaire',
      ],
    }],
  });
};

exports.subscribe = async (req, res, next) => {
  try {
    const { provider } = z.object({
      provider: z.enum(['WAVE', 'ORANGE_MONEY', 'FREE_MONEY', 'PAYDUNYA', 'CARD']),
    }).parse(req.body);

    const sub = await prisma.subscription.create({
      data: {
        userId: req.user.id,
        plan: PLAN_MONTHLY.key,
        amount: PLAN_MONTHLY.amount,
        provider,
        status: 'PENDING',
      },
    });

    const payment = await initiatePayment({
      provider,
      amount: PLAN_MONTHLY.amount,
      description: `Abonnement vendeur — ${PLAN_MONTHLY.label}`,
      callbackUrl: `${process.env.APP_URL}/v1/webhooks/payment`,
      metadata: { ref: sub.id, type: 'SUBSCRIPTION' },
      customer: { phone: req.user.phone, name: req.user.name },
    });

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { providerRef: payment.reference },
    });

    res.status(201).json({
      subscriptionId: sub.id,
      paymentUrl: payment.paymentUrl,
    });
  } catch (err) {
    next(err);
  }
};

exports.mine = async (req, res, next) => {
  try {
    const sub = await prisma.subscription.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    const now = new Date();
    const isActive = sub && sub.status === 'ACTIVE' && sub.endsAt > now;
    res.json({ subscription: sub, isActive });
  } catch (err) {
    next(err);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const sub = await prisma.subscription.findFirst({
      where: { userId: req.user.id, status: 'ACTIVE' },
      orderBy: { endsAt: 'desc' },
    });
    if (!sub) return res.status(404).json({ error: { code: 'NO_SUB', message: 'Aucun abonnement actif' } });
    const updated = await prisma.subscription.update({
      where: { id: sub.id },
      data: { autoRenew: false },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * Webhook paiement générique (Wave + PayDunya).
 * Le fournisseur POST { reference, status, amount, metadata }.
 */
exports.webhook = async (req, res, next) => {
  try {
    // Wave : vérifie HMAC
    if (req.headers['wave-signature']) {
      const ok = verifyWaveSignature(JSON.stringify(req.body), req.headers['wave-signature']);
      if (!ok) return res.status(401).send('bad signature');
    }

    const { reference, status, metadata } = req.body;
    if (!reference) return res.status(400).send('missing ref');

    const ref = metadata?.ref || reference;
    const sub = await prisma.subscription.findFirst({
      where: { OR: [{ id: ref }, { providerRef: reference }] },
    });
    if (!sub) return res.status(404).send('sub not found');

    if (status === 'SUCCESS' || status === 'completed' || status === 'paid') {
      const startsAt = new Date();
      const endsAt = new Date(startsAt.getTime() + PLAN_MONTHLY.durationDays * 24 * 3600 * 1000);
      await prisma.$transaction([
        prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'ACTIVE', startsAt, endsAt },
        }),
        prisma.user.update({
          where: { id: sub.userId },
          data: { role: 'SELLER' },
        }),
        prisma.notification.create({
          data: {
            userId: sub.userId,
            type: 'SUBSCRIPTION_ACTIVATED',
            payload: { subscriptionId: sub.id, endsAt },
          },
        }),
      ]);
    } else if (status === 'FAILED' || status === 'failed') {
      await prisma.subscription.update({ where: { id: sub.id }, data: { status: 'FAILED' } });
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
