import { motion } from 'framer-motion';
import t from '../../theme.js';
import { NAV_ITEMS } from '../constants.js';

/**
 * Componente de navegación flotante con estilo pill
 * Muestra los elementos de navegación con animaciones y estados activos
 */
export default function Navigation({ activeTab, onTabChange }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      padding: `${t.spacing.lg} ${t.spacing.md} ${t.spacing.sm}`,
      position: 'relative',
      zIndex: 100,
    }}>
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: t.colors.surface,
          border: t.chunkyBorder,
          borderRadius: t.radii.full,
          padding: '6px 8px',
          boxShadow: t.chunkyShadow,
        }}
      >
        {NAV_ITEMS.map(item => {
          const isActive = activeTab === item.key;
          return (
            <motion.button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              animate={isActive ? { scale: 1.02 } : { scale: 1 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: isActive ? '10px 22px' : '10px 16px',
                borderRadius: t.radii.full,
                border: isActive ? t.chunkyBorder : '3px solid transparent',
                background: isActive ? t.colors.accent : 'transparent',
                color: isActive ? t.colors.white : t.colors.textSecondary,
                fontFamily: t.fonts.display,
                fontWeight: isActive ? 700 : 600,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: isActive ? t.chunkyShadowSm : 'none',
                transition: 'background 0.2s, color 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.emoji}</span>
              {isActive && <span>{item.label}</span>}
            </motion.button>
          );
        })}
      </motion.nav>
    </div>
  );
}
