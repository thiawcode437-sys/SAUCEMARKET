export const colors = {
  primary: '#16A34A',      // Vert Sénégal
  primaryDark: '#15803D',
  accent: '#EAB308',       // Or
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
  danger: '#DC2626',
  success: '#16A34A',
  warning: '#F59E0B',
};

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32,
};

export const radius = { sm: 6, md: 12, lg: 20, pill: 999 };

export const typography = {
  h1: { fontSize: 28, fontWeight: '700', color: colors.text },
  h2: { fontSize: 22, fontWeight: '700', color: colors.text },
  h3: { fontSize: 18, fontWeight: '600', color: colors.text },
  body: { fontSize: 15, color: colors.text },
  caption: { fontSize: 12, color: colors.textMuted },
};

export const formatFCFA = (n) =>
  `${Number(n).toLocaleString('fr-FR').replace(/,/g, ' ')} FCFA`;
