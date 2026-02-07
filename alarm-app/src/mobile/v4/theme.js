// V4: "Editorial Luxe" — Magazine-inspired, high-end type, black + gold
// Fonts: Playfair Display (display) + Libre Franklin (body)
// Palette: deep charcoal bg, warm gold accent, cream text

const theme = {
  name: 'Editorial Luxe',
  fonts: {
    display: "'Playfair Display', Georgia, serif",
    body: "'Libre Franklin', 'Segoe UI', sans-serif",
  },
  googleFonts: 'Playfair+Display:wght@400;500;600;700;800;900&family=Libre+Franklin:wght@300;400;500;600',
  colors: {
    bg: '#141210',
    surface: '#1C1A17',
    surfaceAlt: '#242118',
    text: '#F5F0E8',
    textSecondary: '#A8A090',
    textMuted: '#6B6560',
    accent: '#D4A857',
    accentLight: '#E8CC8A',
    accentDark: '#B8903A',
    success: '#8AAF75',
    border: '#2E2A24',
    shadow: 'rgba(212, 168, 87, 0.08)',
    disabled: '#3A3530',
    white: '#F5F0E8',
    overlay: 'rgba(20, 18, 16, 0.8)',
  },
  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '100px',
  },
  spacing: {
    xs: '6px',
    sm: '12px',
    md: '24px',
    lg: '32px',
    xl: '48px',
  },
};

export default theme;
