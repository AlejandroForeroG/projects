// Design version registry — add new versions here to scale to 54
// Each entry maps a version number to its lazy-loaded component

import { lazy } from 'react';

const registry = {
  1: lazy(() => import('./v1/index.jsx')),
  2: lazy(() => import('./v2/index.jsx')),
  3: lazy(() => import('./v3/index.jsx')),
  4: lazy(() => import('./v4/index.jsx')),
  5: lazy(() => import('./v5/index.jsx')),
};

// Theme metadata for the selector UI
export const versionMeta = {
  1: { name: 'Warm Earth', desc: 'Organic, nature-inspired warmth' },
  2: { name: 'Midnight Brutalist', desc: 'Dark, raw, monospaced edge' },
  3: { name: 'Soft Dreamscape', desc: 'Pastel gradients, airy pillows' },
  4: { name: 'Editorial Luxe', desc: 'Magazine-style, black & gold' },
  5: { name: 'Neo-Retro Pop', desc: 'Chunky, colorful, playful' },
};

export const TOTAL_VERSIONS = Object.keys(registry).length;

export default registry;
