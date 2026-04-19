require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CATEGORIES = [
  { slug: 'mode', name: 'Mode', nameWolof: 'Yéerémou', icon: '👕' },
  { slug: 'tech', name: 'Tech', nameWolof: 'Tekno', icon: '📱' },
  { slug: 'maison', name: 'Maison', nameWolof: 'Kër', icon: '🏠' },
  { slug: 'beaute', name: 'Beauté', nameWolof: 'Rafet', icon: '💄' },
  { slug: 'alimentation', name: 'Alimentation', nameWolof: 'Ñam', icon: '🍲' },
  { slug: 'services', name: 'Services', nameWolof: 'Ligeey', icon: '🛠️' },
  { slug: 'auto', name: 'Auto & Moto', nameWolof: 'Oto', icon: '🚗' },
  { slug: 'immobilier', name: 'Immobilier', nameWolof: 'Kër', icon: '🏘️' },
];

async function main() {
  console.log('🌱 Seeding categories...');
  for (const [i, c] of CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, order: i },
    });
  }

  console.log('👑 Creating admin...');
  await prisma.user.upsert({
    where: { phone: '+221770000000' },
    update: {},
    create: {
      phone: '+221770000000',
      email: 'admin@saucemarket.sn',
      name: 'Admin',
      role: 'ADMIN',
      isVerified: true,
      passwordHash: await bcrypt.hash('admin123', 10),
    },
  });

  console.log('⚙️  Default config...');
  await prisma.appConfig.upsert({
    where: { key: 'COMMISSION_RATE' },
    update: {},
    create: { key: 'COMMISSION_RATE', value: '0.05' },
  });
  await prisma.appConfig.upsert({
    where: { key: 'SUBSCRIPTION_MONTHLY_FCFA' },
    update: {},
    create: { key: 'SUBSCRIPTION_MONTHLY_FCFA', value: '1000' },
  });

  console.log('✅ Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
