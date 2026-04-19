require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { attachSocket } = require('./services/socketService');

const app = express();
const server = http.createServer(app);

// --- Security & parsing ---
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// --- Rate limit global ---
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
}));

// --- Health ---
app.get('/', (_req, res) => res.json({
  name: 'Sauce Market API',
  status: 'ok',
  version: 'v1',
  time: new Date().toISOString(),
}));

// --- Routes v1 ---
app.use('/v1', routes);

// --- Error handler (last) ---
app.use(errorHandler);

// --- Socket.IO ---
const io = new Server(server, {
  cors: { origin: true, credentials: true },
  pingTimeout: 20000,
});
attachSocket(io);

// --- Start ---
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🛍️  Sauce Market API running on :${PORT}`);
});

module.exports = { app, server, io };
