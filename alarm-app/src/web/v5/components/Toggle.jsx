import { motion } from 'framer-motion';
import t from '../../theme.js';

export default function Toggle({ on, onToggle, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
      <span style={{ fontFamily: t.fonts.body, fontWeight: 600, fontSize: '15px', color: t.colors.text }}>{label}</span>
      <motion.div
        onClick={onToggle}
        style={{
          width: 52,
          height: 30,
          borderRadius: t.radii.full,
          border: t.chunkyBorder,
          background: on ? t.colors.teal : t.colors.border,
          cursor: 'pointer',
          position: 'relative',
          flexShrink: 0,
        }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ x: on ? 23 : 3 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: t.colors.white,
            border: t.chunkyBorder,
            position: 'absolute',
            top: 2,
          }}
        />
      </motion.div>
    </div>
  );
}
