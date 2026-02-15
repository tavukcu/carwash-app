// Kiosk Terminal Design Tokens
// Açık yeşil-beyaz tema, profesyonel kiosk görünümü

export const K = {
  // Background colors
  bg: '#f0fdf4',
  bgCard: '#ffffff',
  bgCardHover: '#ecfdf5',
  bgInput: '#f8faf9',
  bgHeader: '#166534',

  // Accent / Primary
  accent: '#16a34a',
  accentDark: '#15803d',
  accentGlow: 'rgba(22,163,74,0.08)',
  accentBorder: 'rgba(22,163,74,0.25)',

  // Status colors
  green: '#16a34a',
  greenBg: '#dcfce7',
  greenBorder: '#86efac',
  red: '#dc2626',
  redBg: '#fef2f2',
  redBorder: '#fecaca',
  yellow: '#d97706',
  yellowBg: '#fffbeb',
  yellowBorder: '#fde68a',
  purple: '#7c3aed',

  // Text
  text: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',

  // Border
  border: '#e2e8f0',
  borderLight: '#f1f5f9',

  // Sizing for touch targets
  btnHeight: 100,
  iconSize: 60,
  iconSizeLg: 80,
  fontXl: 32,
  fontLg: 26,
  fontMd: 21,
  fontSm: 17,
  fontXs: 14,
  radius: 22,
  radiusSm: 16,
} as const;
