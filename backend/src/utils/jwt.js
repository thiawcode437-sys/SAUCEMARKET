const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'dev-only-secret';
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES_IN || '30d';

function signAccess(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
}

function signRefresh(payload) {
  return jwt.sign({ ...payload, kind: 'refresh' }, SECRET, { expiresIn: REFRESH_EXPIRES });
}

function verify(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { signAccess, signRefresh, verify };
