const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 3, lazyConnect: false })
  : null;

if (redis) {
  redis.on('error', (err) => console.error('[redis]', err.message));
}

module.exports = { prisma, redis };
