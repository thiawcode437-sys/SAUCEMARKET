const axios = require('axios');
const crypto = require('crypto');

/**
 * Service de paiement — agrège Wave (direct) et PayDunya (Orange Money / Free Money / carte).
 * Chaque `initiate*` renvoie { paymentUrl, reference } que l'app mobile ouvre via deep-link.
 * Les webhooks postent sur /v1/webhooks/payment.
 */

const PAYDUNYA_BASE = process.env.PAYDUNYA_MODE === 'live'
  ? 'https://app.paydunya.com/api/v1'
  : 'https://app.paydunya.com/sandbox-api/v1';

function paydunyaHeaders() {
  return {
    'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY,
    'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY,
    'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN,
    'Content-Type': 'application/json',
  };
}

async function initiatePaydunya({ amount, description, customer, metadata, callbackUrl }) {
  const payload = {
    invoice: {
      total_amount: amount,
      description,
    },
    store: { name: 'Sauce Market' },
    custom_data: metadata,
    actions: {
      callback_url: callbackUrl,
      return_url: `${process.env.APP_URL}/pay/return`,
      cancel_url: `${process.env.APP_URL}/pay/cancel`,
    },
  };
  const { data } = await axios.post(`${PAYDUNYA_BASE}/checkout-invoice/create`, payload, {
    headers: paydunyaHeaders(),
  });
  if (data.response_code !== '00') throw new Error(data.response_text || 'PAYDUNYA_ERROR');
  return { paymentUrl: data.response_text, reference: data.token };
}

async function initiateWave({ amount, description, callbackUrl, metadata }) {
  const { data } = await axios.post(
    'https://api.wave.com/v1/checkout/sessions',
    {
      amount: String(amount),
      currency: 'XOF',
      error_url: `${process.env.APP_URL}/pay/cancel`,
      success_url: `${process.env.APP_URL}/pay/return`,
      client_reference: metadata?.ref,
      webhook_url: callbackUrl,
    },
    { headers: { Authorization: `Bearer ${process.env.WAVE_API_KEY}` } },
  );
  return { paymentUrl: data.wave_launch_url, reference: data.id };
}

async function initiatePayment({ provider, ...rest }) {
  switch (provider) {
    case 'WAVE':
      return initiateWave(rest);
    case 'ORANGE_MONEY':
    case 'FREE_MONEY':
    case 'PAYDUNYA':
    case 'CARD':
      return initiatePaydunya(rest);
    default:
      throw new Error(`UNSUPPORTED_PROVIDER:${provider}`);
  }
}

/**
 * Vérifie signature du webhook Wave.
 * Wave signe avec HMAC-SHA256 sur le body brut.
 */
function verifyWaveSignature(rawBody, signature) {
  const expected = crypto
    .createHmac('sha256', process.env.WAVE_WEBHOOK_SECRET || '')
    .update(rawBody)
    .digest('hex');
  return signature && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

module.exports = { initiatePayment, verifyWaveSignature };
