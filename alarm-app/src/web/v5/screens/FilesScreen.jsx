import { motion } from 'framer-motion';
import t from '../../theme.js';
import { tileHeader } from '../styles.js';
import { DecoShape, Tile } from '../components/index.js';

export default function FilesScreen() {
  const files = [
    { id: 1, name: 'Sleep Report Jan.pdf', size: '2.4 MB', date: '2026-01-15', type: 'pdf', emoji: '📄' },
    { id: 2, name: 'Weekly Stats.xlsx', size: '156 KB', date: '2026-01-10', type: 'excel', emoji: '📊' },
    { id: 3, name: 'Alarm Settings.json', size: '12 KB', date: '2026-01-05', type: 'json', emoji: '⚙️' },
    { id: 4, name: 'Sleep Data Export.csv', size: '89 KB', date: '2025-12-28', type: 'csv', emoji: '📈' },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridTemplateRows: 'auto auto',
      gap: t.spacing.md,
      width: '100%',
    }}>
      {/* Header tile — 4 cols */}
      <Tile span="1 / span 4" delay={0}>
        <DecoShape shape="circle" size={80} color={t.colors.purpleLight} top={-20} right={-20} opacity={0.3} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={tileHeader}>
            <span style={{ fontSize: '28px' }}>📁</span>
            Your Files
          </div>
          <p style={{ 
            fontFamily: t.fonts.body, 
            fontSize: '14px', 
            color: t.colors.textSecondary,
            marginTop: '8px' 
          }}>
            Access and manage your sleep data exports and reports
          </p>
        </div>
      </Tile>

      {/* File tiles */}
      {files.map((file, i) => (
        <Tile key={file.id} span={`${(i % 4) + 1} / span 1`} delay={0.1 + i * 0.05}>
          <DecoShape 
            shape={i % 2 === 0 ? 'circle' : 'square'} 
            size={30} 
            color={i % 3 === 0 ? t.colors.tealLight : i % 3 === 1 ? t.colors.purpleLight : t.colors.yellowLight} 
            top={-8} 
            right={-8} 
            opacity={0.5} 
          />
          <motion.div 
            style={{ position: 'relative', zIndex: 1, cursor: 'pointer' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px', textAlign: 'center' }}>{file.emoji}</div>
            <div style={{ 
              fontFamily: t.fonts.display, 
              fontWeight: 700, 
              fontSize: '13px', 
              color: t.colors.text,
              marginBottom: '4px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {file.name}
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontFamily: t.fonts.body, 
              fontSize: '11px', 
              color: t.colors.textMuted 
            }}>
              <span>{file.size}</span>
              <span>{file.date}</span>
            </div>
          </motion.div>
        </Tile>
      ))}

      {/* Upload tile */}
      <Tile span="1 / span 2" delay={0.3} style={{ background: t.colors.accentLight, cursor: 'pointer' }}>
        <DecoShape shape="circle" size={40} color={t.colors.accent} bottom={-10} right={-10} opacity={0.3} />
        <motion.div 
          style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⬆️</div>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '14px', color: t.colors.accent }}>
            Upload New File
          </div>
        </motion.div>
      </Tile>

      {/* Export tile */}
      <Tile span="3 / span 2" delay={0.35} style={{ background: t.colors.tealLight, cursor: 'pointer' }}>
        <DecoShape shape="diamond" size={30} color={t.colors.teal} top={-8} left={-8} opacity={0.4} />
        <motion.div 
          style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📤</div>
          <div style={{ fontFamily: t.fonts.display, fontWeight: 700, fontSize: '14px', color: t.colors.teal }}>
            Export All Data
          </div>
        </motion.div>
      </Tile>
    </div>
  );
}
