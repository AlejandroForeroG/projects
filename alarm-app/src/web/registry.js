// Web design version registry — lazy-loaded web versions derived from mobile/v5
import { lazy } from 'react';

const webRegistry = {
  1: lazy(() => import('./v1/index.jsx')),
  2: lazy(() => import('./v2/index.jsx')),
  3: lazy(() => import('./v3/index.jsx')),
  4: lazy(() => import('./v4/index.jsx')),
  5: lazy(() => import('./v5/index.jsx')),
};

export const webVersionMeta = {
  1: { name: 'Classic Sidebar', desc: 'Traditional sidebar navigation, structured panels' },
  2: { name: 'Top Nav Dashboard', desc: 'Horizontal nav with card-based layout' },
  3: { name: 'Compact Icon Rail', desc: 'Icon-only rail + split-panel content' },
  4: { name: 'Bold Tab Strip', desc: 'Full-width tabs with magazine sections' },
  5: { name: 'Floating Bento', desc: 'Floating pill nav + bento-grid dashboard' },
};

export const WEB_TOTAL_VERSIONS = Object.keys(webRegistry).length;

export default webRegistry;
