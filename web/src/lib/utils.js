import clsx from 'clsx';

export const cn = (...args) => clsx(...args);

export const formatFCFA = (n) =>
  n == null ? '—' : `${Number(n).toLocaleString('fr-FR').replace(/,/g, ' ')} FCFA`;

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const timeAgo = (d) => {
  if (!d) return '';
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return 'à l\'instant';
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  if (s < 2592000) return `il y a ${Math.floor(s / 86400)} j`;
  return formatDate(d);
};
