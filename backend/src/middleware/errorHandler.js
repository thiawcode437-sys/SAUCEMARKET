module.exports = function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.publicMessage || err.message || 'Une erreur est survenue';

  if (status >= 500) {
    console.error('[error]', err);
  }

  res.status(status).json({ error: { code, message } });
};
