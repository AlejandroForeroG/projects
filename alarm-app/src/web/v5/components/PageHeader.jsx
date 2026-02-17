import { motion } from 'framer-motion';
import t from '../../theme.js';
import { NAV_ITEMS } from '../constants.js';
import { getScreenTitle, getScreenSubtitle } from '../config.js';

/**
 * Componente de encabezado de página
 * Muestra el título y subtítulo de la pantalla activa con animaciones
 */
export default function PageHeader({ activeTab }) {
  const currentItem = NAV_ITEMS.find(n => n.key === activeTab);
  const title = getScreenTitle(activeTab);
  const subtitle = getScreenSubtitle(activeTab);

  return (
    <div style={{
      textAlign: 'center',
      padding: `${t.spacing.sm} ${t.spacing.md} ${t.spacing.md}`,
      position: 'relative',
      zIndex: 1,
    }}>
      <motion.h1
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{
          fontFamily: t.fonts.display,
          fontWeight: 800,
          fontSize: '28px',
          color: t.colors.text,
          margin: 0,
        }}
      >
        {currentItem?.emoji} {title}
      </motion.h1>
      <motion.p
        key={activeTab + '-sub'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{
          fontFamily: t.fonts.body,
          fontSize: '15px',
          color: t.colors.textMuted,
          margin: '4px 0 0',
        }}
      >
        {subtitle}
      </motion.p>
    </div>
  );
}
