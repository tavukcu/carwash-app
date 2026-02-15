// Kiosk Terminal Design Tokens
// Ziraat Bankası sıra matik tarzı profesyonel kiosk görünümü

export const K = {
  // Background colors
  bg: '#0a1628',
  bgCard: '#0f2035',
  bgCardHover: '#132a45',
  bgInput: '#0c1c30',
  bgHeader: '#061020',

  // Accent / Primary
  accent: '#00b4d8',
  accentDark: '#0077b6',
  accentGlow: 'rgba(0,180,216,0.15)',
  accentBorder: 'rgba(0,180,216,0.3)',

  // Status colors
  green: '#00e676',
  greenBg: 'rgba(0,230,118,0.12)',
  greenBorder: 'rgba(0,230,118,0.3)',
  red: '#ff5252',
  redBg: 'rgba(255,82,82,0.12)',
  redBorder: 'rgba(255,82,82,0.3)',
  yellow: '#ffca28',
  yellowBg: 'rgba(255,202,40,0.12)',
  yellowBorder: 'rgba(255,202,40,0.3)',
  purple: '#b388ff',

  // Text
  text: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.6)',
  textMuted: 'rgba(255,255,255,0.35)',

  // Border
  border: 'rgba(255,255,255,0.08)',
  borderLight: 'rgba(255,255,255,0.12)',

  // Sizing for touch targets
  btnHeight: 80,
  iconSize: 52,
  iconSizeLg: 72,
  fontXl: 28,
  fontLg: 22,
  fontMd: 18,
  fontSm: 15,
  fontXs: 13,
  radius: 20,
  radiusSm: 14,
} as const;
