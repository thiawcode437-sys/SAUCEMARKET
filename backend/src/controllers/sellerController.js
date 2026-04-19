const { prisma } = require('../config/db');

exports.stats = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const monthAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);

    const [productsCount, viewsAgg, salesAgg, topProducts] = await Promise.all([
      prisma.product.count({ where: { sellerId, status: 'PUBLISHED' } }),
      prisma.product.aggregate({ where: { sellerId }, _sum: { views: true } }),
      prisma.order.aggregate({
        where: { sellerId, status: { in: ['PAID', 'DELIVERED'] }, paidAt: { gte: monthAgo } },
        _sum: { amount: true, commission: true },
        _count: true,
      }),
      prisma.product.findMany({
        where: { sellerId, status: 'PUBLISHED' },
        orderBy: { views: 'desc' },
        take: 5,
        include: { images: { take: 1 } },
      }),
    ]);

    const grossRevenue = salesAgg._sum.amount || 0;
    const commissionPaid = salesAgg._sum.commission || 0;

    res.json({
      productsPublished: productsCount,
      totalViews: viewsAgg._sum.views || 0,
      salesCount: salesAgg._count,
      grossRevenue,
      netRevenue: grossRevenue - commissionPaid,
      commissionPaid,
      topProducts,
    });
  } catch (err) {
    next(err);
  }
};

exports.revenue = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const where = {
      sellerId: req.user.id,
      status: { in: ['PAID', 'DELIVERED'] },
      paidAt: {
        gte: from ? new Date(from) : new Date(Date.now() - 30 * 24 * 3600 * 1000),
        lte: to ? new Date(to) : new Date(),
      },
    };
    const orders = await prisma.order.findMany({
      where,
      select: { amount: true, commission: true, paidAt: true },
      orderBy: { paidAt: 'asc' },
    });
    // Group by day
    const byDay = new Map();
    for (const o of orders) {
      const key = o.paidAt.toISOString().slice(0, 10);
      const prev = byDay.get(key) || { date: key, revenue: 0, commission: 0, count: 0 };
      prev.revenue += o.amount;
      prev.commission += o.commission;
      prev.count += 1;
      byDay.set(key, prev);
    }
    res.json({ series: [...byDay.values()] });
  } catch (err) {
    next(err);
  }
};
