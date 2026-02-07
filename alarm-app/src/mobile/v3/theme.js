// V3: "Soft Dreamscape" — Pastel gradients, pill shapes, airy spacing, whimsical
// Fonts: Quicksand (display) + DM Sans (body)
// Palette: lavender/peach gradients, soft purple accent, light bg

const theme = {
  name: 'Soft Dreamscape',
  fonts: {
    display: "'Quicksand', 'Segoe UI', sans-serif",
    body: "'DM Sans', 'Segoe UI', sans-serif",
  },
  googleFonts: 'Quicksand:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600',
  colors: {
    bg: '#F8F5FF',
    surface: '#FFFFFF',
    surfaceAlt: '#F0EBFF',
    text: '#2D2640',
    textSecondary: '#7B6F99',
    textMuted: '#B5ABCC',
    accent: '#8B6CE0',
    accentLight: '#C4B3F5',
    accentDark: '#6A4DC0',
    success: '#6DD4A0',
    border: '#E8E2F5',
    shadow: 'rgba(139, 108, 224, 0.12)',
    disabled: '#D8D0EC',
    white: '#FFFFFF',
    overlay: 'rgba(45, 38, 64, 0.4)',
    peach: '#FFDDC9',
    peachDark: '#FFB88C',
    lavender: '#E8DFFF',
    gradient1: 'linear-gradient(135deg, #E8DFFF 0%, #FFDDC9 100%)',
    gradient2: 'linear-gradient(135deg, #8B6CE0 0%, #E87EBF 100%)',
  },
  radii: {
    sm: '16px',
    md: '24px',
    lg: '32px',
    full: '100px',
  },
  spacing: {
    xs: '8px',
    sm: '14px',
    md: '22px',
    lg: '30px',
    xl: '44px',
  },
};

export default theme;
