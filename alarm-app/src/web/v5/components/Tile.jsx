import { motion } from 'framer-motion';
import { tileBase } from '../styles.js';

export default function Tile({ children, style, delay = 0, span = '1 / span 1', rowSpan = '1 / span 1', onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay }}
      whileHover={{ y: -4, boxShadow: '7px 7px 0px #1A2B3C', transition: { duration: 0.15 } }}
      onClick={onClick}
      style={{
        ...tileBase,
        gridColumn: span,
        gridRow: rowSpan,
        ...style,
        zIndex: 1,
      }}
    >
      {children}
    </motion.div>
  );
}
