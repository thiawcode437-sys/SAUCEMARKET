import clsx from 'clsx';

export const cn = (...args) => clsx(...args);

export const formatFCFA = (n) =>
  n == null ? '—' : `${Number(n).toLocaleString('fr-FR').replace(/,/g, ' ')} FCFA`;

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—';
