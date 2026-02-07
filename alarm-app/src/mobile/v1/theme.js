// V1: "Warm Earth" — Organic, warm tones, rounded shapes, nature-inspired
// Fonts: Fraunces (display) + Source Sans 3 (body)
// Palette: warm cream background, terracotta accents, deep brown text

const theme = {
  name: 'Warm Earth',
  fonts: {
    display: "'Fraunces', Georgia, serif",
    body: "'Source Sans 3', 'Segoe UI', sans-serif",
  },
  googleFonts: 'Fraunces:wght@400;600;700;900&family=Source+Sans+3:wght@300;400;500;600',
  colors: {
    bg: '#FBF7F0',
    surface: '#F5EDE0',
    surfaceAlt: '#EDE3D0',
    text: '#2C1810',
    textSecondary: '#8B6F5C',
    textMuted: '#B8A08A',
    accent: '#C45D3E',
    accentLight: '#E8A58C',
    accentDark: '#9B3A20',
    success: '#5A8F6A',
    border: '#E0D5C5',
    shadow: 'rgba(44, 24, 16, 0.08)',
    disabled: '#D4C8B8',
    white: '#FFFFFF',
    overlay: 'rgba(44, 24, 16, 0.5)',
  },
  radii: {
    sm: '12px',
    md: '20px',
    lg: '28px',
    full: '100px',
  },
  spacing: {
    xs: '6px',
    sm: '12px',
    md: '20px',
    lg: '28px',
    xl: '40px',
  },
};

export default theme;
