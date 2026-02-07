import { motion, AnimatePresence } from 'framer-motion';
import t from '../../theme.js';
import DecoShape from './DecoShape.jsx';

export default function ModalOverlay({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: t.colors.overlay,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: t.colors.surface,
              border: t.chunkyBorder,
              borderRadius: t.radii.xl,
              boxShadow: '8px 8px 0px #1A2B3C',
              padding: t.spacing.xl,
              minWidth: 380,
              maxWidth: 520,
              width: '90%',
              position: 'relative',
            }}
          >
            <DecoShape shape="circle" size={60} color={t.colors.accentLight} top={-15} right={-15} opacity={0.4} />
            <DecoShape shape="square" size={30} color={t.colors.yellowLight} bottom={-8} left={-8} opacity={0.5} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.md, position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontFamily: t.fonts.display, fontWeight: 800, fontSize: '22px', color: t.colors.text, margin: 0 }}>{title}</h2>
              <motion.button
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={{
                  background: t.colors.bg,
                  border: t.chunkyBorder,
                  borderRadius: t.radii.full,
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: t.colors.text,
                }}
              >
                ✕
              </motion.button>
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
