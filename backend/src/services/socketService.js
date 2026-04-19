const { verify } = require('../utils/jwt');
const { prisma } = require('../config/db');

/**
 * Socket.IO namespace : auth par JWT, rooms = `user:<id>` + `conv:<convId>`.
 * Events :
 *   client → server : conv:join, message:send, message:read, typing
 *   server → client : message:new, message:read, typing, notification
 */
function attachSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) throw new Error('NO_TOKEN');
      const payload = verify(token);
      socket.userId = payload.sub;
      next();
    } catch (err) {
      next(new Error('UNAUTHORIZED'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on('conv:join', (convId) => {
      socket.join(`conv:${convId}`);
    });

    socket.on('message:send', async ({ convId, body, imageUrl }, cb) => {
      try {
        const conv = await prisma.conversation.findUnique({ where: { id: convId } });
        if (!conv) return cb?.({ ok: false, error: 'CONV_NOT_FOUND' });
        if (![conv.buyerId, conv.sellerId].includes(socket.userId)) {
          return cb?.({ ok: false, error: 'FORBIDDEN' });
        }
        const msg = await prisma.message.create({
          data: { conversationId: convId, senderId: socket.userId, body, imageUrl },
        });
        await prisma.conversation.update({
          where: { id: convId },
          data: { lastMessage: body || '📷 Image' },
        });
        io.to(`conv:${convId}`).emit('message:new', msg);
        const otherId = conv.buyerId === socket.userId ? conv.sellerId : conv.buyerId;
        io.to(`user:${otherId}`).emit('notification', {
          type: 'NEW_MESSAGE',
          convId,
          preview: body?.slice(0, 80),
        });
        cb?.({ ok: true, message: msg });
      } catch (err) {
        console.error('[socket message:send]', err);
        cb?.({ ok: false, error: 'INTERNAL' });
      }
    });

    socket.on('message:read', async ({ convId }) => {
      await prisma.message.updateMany({
        where: { conversationId: convId, senderId: { not: socket.userId }, readAt: null },
        data: { readAt: new Date() },
      });
      io.to(`conv:${convId}`).emit('message:read', { convId, by: socket.userId });
    });

    socket.on('typing', ({ convId, isTyping }) => {
      socket.to(`conv:${convId}`).emit('typing', { convId, userId: socket.userId, isTyping });
    });
  });
}

module.exports = { attachSocket };
