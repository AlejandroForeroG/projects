// V2: "Midnight Brutalist" — Dark, bold, high-contrast, monospaced, raw edges
// Fonts: JetBrains Mono (display+body) + Space Mono (accents)
// Palette: near-black bg, electric cyan accent, stark white text

const theme = {
  name: 'Midnight Brutalist',
  fonts: {
    display: "'JetBrains Mono', 'Courier New', monospace",
    body: "'Space Mono', 'Courier New', monospace",
  },
  googleFonts: 'JetBrains+Mono:wght@400;500;700;800&family=Space+Mono:wght@400;700',
  colors: {
    bg: '#0A0A0C',
    surface: '#141418',
    surfaceAlt: '#1E1E24',
    text: '#E8E8EC',
    textSecondary: '#8888A0',
    textMuted: '#55556A',
    accent: '#00F0FF',
    accentLight: '#80F8FF',
    accentDark: '#00B8C4',
    success: '#00FF88',
    border: '#2A2A35',
    shadow: 'rgba(0, 240, 255, 0.1)',
    disabled: '#333340',
    white: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  radii: {
    sm: '2px',
    md: '4px',
    lg: '6px',
    full: '2px',
  },
  spacing: {
    xs: '6px',
    sm: '12px',
    md: '20px',
    lg: '24px',
    xl: '36px',
  },
};

export default theme;
