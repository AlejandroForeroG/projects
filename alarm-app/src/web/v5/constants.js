import t from '../theme.js';

// ── Load Google Fonts ──────────────────────────────────────────────
(() => {
  if (typeof document === 'undefined') return;
  if (document.getElementById('v5-gfonts')) return;
  const link = document.createElement('link');
  link.id = 'v5-gfonts';
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${t.googleFonts}&display=swap`;
  document.head.appendChild(link);
})();

export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export const NAV_ITEMS = [
  { key: 'sleep', label: 'Sleep', emoji: '😴' },
  { key: 'dashboard', label: 'Dashboard', emoji: '📊' },
  { key: 'calendar', label: 'Calendar', emoji: '📅' },
  { key: 'files', label: 'Files', emoji: '📁' },
];
