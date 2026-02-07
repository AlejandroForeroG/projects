import { motion } from 'framer-motion';
import t from '../../theme.js';

export default function PillButton({ label, onClick, color = t.colors.accent, textColor = t.colors.white, small, disabled }) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.05, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={disabled ? undefined : onClick}
      style={{
        fontFamily: t.fonts.display,
        fontWeight: 700,
        fontSize: small ? '13px' : '15px',
        color: disabled ? t.colors.textMuted : textColor,
        background: disabled ? t.colors.disabled : color,
        border: t.chunkyBorder,
        borderRadius: t.radii.full,
        padding: small ? '8px 18px' : '12px 28px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : t.chunkyShadowSm,
      }}
    >
      {label}
    </motion.button>
  );
}
