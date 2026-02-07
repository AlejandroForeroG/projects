// Web theme — derived from Mobile v5 "Neo-Retro Pop" design tokens
// Adapted for desktop web: larger spacing, wider typography scale, expanded radii

const webTheme = {
  name: 'Neo-Retro Pop — Web',
  fonts: {
    display: "'Sora', 'Segoe UI', sans-serif",
    body: "'Nunito', 'Segoe UI', sans-serif",
  },
  googleFonts: 'Sora:wght@400;500;600;700;800&family=Nunito:wght@400;500;600;700',
  colors: {
    bg: '#FFFBF5',
    surface: '#FFFFFF',
    surfaceAlt: '#F0F7F5',
    surfaceHover: '#F7F9FB',
    text: '#1A2B3C',
    textSecondary: '#5A6E7F',
    textMuted: '#9AACBB',
    accent: '#FF6B5A',
    accentLight: '#FFB0A5',
    accentDark: '#E04535',
    success: '#2CCCA0',
    border: '#E0E8EE',
    borderLight: '#F0F3F6',
    shadow: 'rgba(26, 43, 60, 0.08)',
    shadowHeavy: 'rgba(26, 43, 60, 0.14)',
    disabled: '#D4DDE5',
    white: '#FFFFFF',
    overlay: 'rgba(26, 43, 60, 0.5)',
    teal: '#2CCCA0',
    tealDark: '#1AAF87',
    tealLight: '#E6F9F3',
    yellow: '#FFD54F',
    yellowLight: '#FFF8E1',
    purple: '#8B7FE8',
    purpleLight: '#EEEAFF',
    purpleDark: '#1A1040',
  },
  radii: {
    xs: '8px',
    sm: '14px',
    md: '20px',
    lg: '28px',
    xl: '36px',
    full: '100px',
  },
  spacing: {
    xs: '8px',
    sm: '14px',
    md: '22px',
    lg: '28px',
    xl: '40px',
    xxl: '56px',
  },
  // Chunky shadow for cards (v5 signature)
  chunkyBorder: '3px solid #1A2B3C',
  chunkyShadow: '5px 5px 0px #1A2B3C',
  chunkyShadowSm: '3px 3px 0px #1A2B3C',
  chunkyShadowAccent: '4px 4px 0px #E04535',
};

export default webTheme;
