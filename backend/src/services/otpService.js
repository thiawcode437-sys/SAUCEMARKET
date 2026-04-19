const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { prisma } = require('../config/db');

const OTP_TTL_MINUTES = 5;
const MAX_ATTEMPTS = 5;

function generateCode() {
  // 6 chiffres, non ambigus
  return String(crypto.randomInt(100000, 999999));
}

async function sendSms(phone, message) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[SMS mock] ${phone} → ${message}`);
    return;
  }
  // Orange SMS API (Sonatel Sénégal)
  try {
    await axios.post(
      'https://api.orange.com/smsmessaging/v1/outbound/tel%3A%2B221/requests',
      {
        outboundSMSMessageRequest: {
          address: `tel:${phone}`,
          senderAddress: `tel:+221`,
          senderName: process.env.ORANGE_SMS_SENDER || 'SauceMkt',
          outboundSMSTextMessage: { message },
        },
      },
      { headers: { Authorization: `Bearer ${await getOrangeToken()}` } },
    );
  } catch (err) {
    console.error('[sms]', err.response?.data || err.message);
    throw new Error('SMS_FAILED');
  }
}

async function getOrangeToken() {
  const basic = Buffer.from(
    `${process.env.ORANGE_SMS_CLIENT_ID}:${process.env.ORANGE_SMS_CLIENT_SECRET}`,
  ).toString('base64');
  const { data } = await axios.post(
    'https://api.orange.com/oauth/v3/token',
    'grant_type=client_credentials',
    { headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' } },
  );
  return data.access_token;
}

async function requestOtp(phone) {
  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  // Invalidate previous unused codes for this phone
  await prisma.otpCode.updateMany({
    where: { phone, usedAt: null },
    data: { usedAt: new Date() },
  });

  await prisma.otpCode.create({ data: { phone, codeHash, expiresAt } });
  await sendSms(phone, `Sauce Market : ton code est ${code}. Valable ${OTP_TTL_MINUTES} min.`);
  return { expiresAt };
}

async function verifyOtp(phone, code) {
  const record = await prisma.otpCode.findFirst({
    where: { phone, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (!record) return { ok: false, reason: 'EXPIRED' };
  if (record.attempts >= MAX_ATTEMPTS) return { ok: false, reason: 'TOO_MANY_ATTEMPTS' };

  const match = await bcrypt.compare(code, record.codeHash);
  if (!match) {
    await prisma.otpCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    return { ok: false, reason: 'INVALID_CODE' };
  }

  await prisma.otpCode.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  return { ok: true };
}

module.exports = { requestOtp, verifyOtp };
